import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit, SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ParticipantSocket } from './models/particpant-socket';
import { MentalState } from './models/mental-state';
import { MeditationGroup } from './models/meditation-group';
import { MeditationGroupService } from './services/meditation-group.service';
import { ParticipantService } from './services/participant.service';
import { MentalStateService } from './services/mental-state.service';
import { CreateMeditationGroupDto } from './dtos/create-meditation-group.dto';
import { JoinGroupDto } from './dtos/join-group.dto';
import { MentalStateDto } from './dtos/mental-state.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { MeditationGroupDto } from './dtos/meditation-group.dto';

/**
 * Manages all socket connections.
 */
@WebSocketGateway()
export class UnityGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  /** meditation groups */
  private groups: { [groupName: string]: MeditationGroup } = { };

  /** Logger **/
  private logger = new Logger(UnityGateway.name);

  constructor(
    private readonly meditationGroupService: MeditationGroupService,
    private readonly participantService: ParticipantService,
    private readonly mentalStateService: MentalStateService
  ) { }

  /**
   * Called once after gateway is initialized.
   */
  afterInit(): void {
    this.logger.log('Gateway initialized.');
  }

  /**
   * Initializes participant socket when client connects.
   * @param client  client socket
   */
  handleConnection(client: ParticipantSocket): void {
    client.groupName = null;
    client.participant = null;
    client.mentalState = new MentalState();
    this.logger.log(`Client ${client.id} connected.`);
  }

  /**
   * Removes participant from group when client disconnects.
   * @param client  client socket
   */
  async handleDisconnect(client: ParticipantSocket): Promise<void> {
    await this.leaveGroup(client);
    this.logger.log(`Client ${client.id} disconnected.`);
  }

  /**
   * Creates new meditation group if the group name is not already taken.
   * @param client  client socket
   * @param createMeditationGroupDto contains group name and duration
   */
  @SubscribeMessage('create-group')
  async createGroup(client: ParticipantSocket, createMeditationGroupDto: CreateMeditationGroupDto): Promise<void> {
    if (!this.groupExists(createMeditationGroupDto.groupName)) {
      const groupEntity = await this.meditationGroupService.createMeditationGroup(createMeditationGroupDto);
      this.groups[createMeditationGroupDto.groupName] = new MeditationGroup(groupEntity.id, createMeditationGroupDto.groupName, createMeditationGroupDto.duration);
      client.emit('group-created', { group: MeditationGroupDto.fromModel(this.groups[createMeditationGroupDto.groupName]) });
      this.logger.log(`Client ${client.id} created group ${createMeditationGroupDto.groupName}.`);

    } else {
      client.emit('group-already-exists', { groupName: createMeditationGroupDto.groupName });
      this.logger.log(`Client ${client.id} tried to create group "${createMeditationGroupDto.groupName}" but group already exists.`);
    }
  }

  /**
   * Checks if group with passed name exists.
   * @param client  client socket
   * @param payload contains group name
   */
  @SubscribeMessage('find-group')
  checkIfGroupExists(client: ParticipantSocket, payload: { groupName: string }): void {
    if (this.groupExists(payload.groupName)) {
      client.emit('group-found', { group: MeditationGroupDto.fromModel(this.groups[payload.groupName]) })

    } else {
      client.emit('group-not-found', { groupName: payload.groupName });
    }
  }

  /**
   * Adds participant to meditation group.
   * @param client  client socket
   * @param joinGroupDto contains group name, nickname and posture
   */
  @SubscribeMessage('join-group')
  async joinGroup(client: ParticipantSocket, joinGroupDto: JoinGroupDto): Promise<void> {
    // Check if client already joined group
    if (client.groupName != null) {
      client.emit("already-joined-group", { groupName: client.groupName });
      return;
    }

    // Check if group exists
    if (!this.groupExists(joinGroupDto.groupName)) {
      client.emit('group-not-found', { groupName: joinGroupDto.groupName });
      this.logger.log(`Client ${client.id} tried to join group ${joinGroupDto.groupName} but group does not exists.`);
      return;
    }

    const group = this.groups[joinGroupDto.groupName];

    // Check if group is already started
    if (group.started !== null) {
      client.emit('group-already-started', { groupName: joinGroupDto.groupName });
      this.logger.log(`Client ${client.id} tried to join group ${joinGroupDto.groupName} but group has already been started.`);
      return;
    }

    // Check if group name is full
    if (group.isFull()) {
      client.emit('group-is-full', { groupName: joinGroupDto.groupName });
      this.logger.log(`Client ${client.id} tried to join group ${joinGroupDto.groupName} but group is full.`);
      return;
    }

    // Check if nickname is already in use
    if (group.nicknameAlreadyExists(joinGroupDto.participant.nickname)) {
      client.emit('nickname-already-exists', { nickname: joinGroupDto.participant.nickname });
      this.logger.log(`Client ${client.id} tried to join group ${joinGroupDto.groupName} but nickname ${joinGroupDto.participant.nickname} is already in use.`);
      return;
    }

    // Let participant join group
    const placeId = group.addParticipant(client);
    client.participant = await this.participantService.createParticipant(group.entityId, placeId, joinGroupDto.participant);
    client.groupName = joinGroupDto.groupName;
    group.participants.forEach(otherClient => otherClient.emit('participant-joined', { participant: ParticipantDto.fromSocket(client) }))
    client.emit('joined-group', { group: MeditationGroupDto.fromModel(group), placeId });
    this.logger.log(`Client ${client.id} joined room ${client.groupName}.`);
  }

  /**
   * Removes client from meditation group.
   * @param client client socket
   * @param notifyParticipants emits message to clients iff true
   */
  @SubscribeMessage('leave-group')
  async leaveGroup(client: ParticipantSocket, notifyParticipants = true): Promise<void> {
    if (client.groupName != null) {
      const groupName = client.groupName;
      const groupId = this.groups[client.groupName].entityId;
      const group = this.groups[client.groupName];
      const placeId = client.participant.placeId;

      // Update database entry
      await this.participantService.leaveMeditationGroup(client.participant.id);

      // Remove attached data
      client.groupName = null;
      client.participant = null;
      group.removeParticipant(client);

      // When last participant left delete group
      if (group.isEmpty()) {
        delete this.groups[groupName];
        // Update database entry
        await this.meditationGroupService.endMeditationGroup(groupId);
        this.logger.log(`Ended group "${groupName}" because last participant left.`);
      }

      this.logger.log(`Client ${client.id} left group ${groupName}.`);
      if (notifyParticipants) {
        client.emit('left-group');
        group.participants.forEach(participantSocket => participantSocket.emit('participant-left', { placeId }));
      }
    }
  }

  /**
   * Starts meditation group.
   * @param client  client socket
   */
  @SubscribeMessage('start-group')
  async startGroup(client: ParticipantSocket): Promise<void> {
    const group = this.groups[client.groupName];
    if (group.isGroupLeader(client) && !group.started !== null) {
      const now = new Date();
      await this.meditationGroupService.startMeditationGroup(group.entityId, now);
      group.started = now;
      group.participants.forEach(participantSocket => participantSocket
        .emit('group-started', { group: MeditationGroupDto.fromModel(group), placeId: client.participant.placeId}));
      this.logger.log(`Client ${client.id} started group "${group.name}".`);
    }
  }

  /**
   * Removes meditation group if empty.
   * @param client  client socket
   * @param payload includes group name
   */
  @SubscribeMessage('remove-empty-group')
  async removeGroup(client: ParticipantSocket, payload: { groupName: string }): Promise<void> {
    const group = this.groups[payload.groupName];
    if (group) {
      if (group.isEmpty()) {
        await this.meditationGroupService.removeMeditationGroup(group.entityId);
        delete this.groups[payload.groupName];
        client.emit('group-removed');
        this.logger.log(`Client ${client.id} removed group "${payload.groupName}".`);
      }
    }
  }

  /**
   * Updates mental state of participant.
   * @param client  client socket
   * @param mentalStateDto contains mind indexes and frequency bands
   */
  @SubscribeMessage('update-mental-state')
  async updateMentalState(client: ParticipantSocket, mentalStateDto: MentalStateDto): Promise<void> {
    await this.mentalStateService.addMentalStateForParticipant(client.participant.id, mentalStateDto);
    client.mentalState = mentalStateDto;
  }

  /**
   * Emits the mental state of the group to all participants each second.
   */
  @Cron('* * * * * *')
  async updateClients(): Promise<void> {

    // Check each group
    for (const group of Object.values(this.groups)) {

      // If group has been started
      if (group.started !== null) {

        // If time is over notify participants
        if (group.timeIsOver()) {
          group.participants.forEach(client => client.emit('time-over'));
          group.participants.forEach(client => this.leaveGroup(client, false));
          this.logger.log(`Time over for group "${group.name}"`)

        // Otherwise share group mental state
        } else {
          const groupMentalState = group.getMentalState();
          await this.mentalStateService.addMentalStateForMeditationGroup(group.entityId, groupMentalState);
          const data = { group: groupMentalState, participants: [] };
          group.participants.forEach(participant => {
            data.participants.push({
              placeId: participant.participant.placeId,
              mentalState: participant.mentalState
            });
          });
          group.participants.forEach(client => client.emit('mental-states', data));
        }
      }
    }
  }

  /**
   * Checks if group exists.
   * @param groupName group name
   * @return true iff group exists
   */
  private groupExists(groupName: string): boolean {
    return groupName in this.groups;
  }
}

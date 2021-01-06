import { Injectable } from '@nestjs/common';
import { Participant } from '../entities/participant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeditationGroupService } from './meditation-group.service';
import { Posture } from '../models/posture';
import { ParticipantDto } from '../dtos/participant.dto';

@Injectable()
export class ParticipantService {

  constructor(
    private readonly meditationGroupService: MeditationGroupService,
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>
  ) { }


  /**
   * Adds new participant to meditation group.
   * @param groupId group ID
   * @param placeId place ID
   * @param participantDto includes nickname and posture
   * @return new participant
   */
  async createParticipant(groupId: number, placeId: number, participantDto: ParticipantDto): Promise<Participant> {
    const participant = new Participant();
    participant.meditationGroupId = groupId;
    participant.nickname = participantDto.nickname;
    participant.placeId = placeId;
    participant.posture = Posture[participantDto.posture];
    return this.participantRepository.save(participant);
  }


  /**
   * Removes participant from group.
   * @param participantId id of participant to be removed from group
   * @return participant that has been removed from group
   */
  async leaveMeditationGroup(participantId: number): Promise<Participant> {
    const participant = await this.getActiveParticipantById(participantId);
    participant.leftGroup = new Date();
    return this.participantRepository.save(participant);
  }

  /**
   * Returns active participant by ID.
   * @param participantId participant ID
   * @return participant object
   */
  private async getActiveParticipantById(participantId: number): Promise<Participant> {
    return this.participantRepository.findOneOrFail(participantId);
  }

}

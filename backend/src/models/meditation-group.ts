import { ParticipantSocket } from './particpant-socket';
import { MentalState } from './mental-state';

/**
 * Manages meditation group state.
 */
export class MeditationGroup {

  /** Database entity ID */
  entityId: number

  /** Date started */
  started: Date;

  /** group name */
  readonly name: string;

  /** Up to six participant sockets */
  readonly participants: ParticipantSocket[];

  /** Duration in minutes */
  duration: number;

  constructor(entityId: number, groupName: string, duration: number) {
    this.entityId = entityId;
    this.name = groupName;
    this.participants = [];
    this.started = null;
    this.duration = duration;
  }

  /**
   * Returns mental state of the group as average of the mental states of all participants.
   * @return mental state of the group
   */
  getMentalState(): MentalState {
    const groupMentalState = new MentalState();
    this.participants.map(socket => socket.mentalState).forEach(mentalState => {
      groupMentalState.relaxation += mentalState.relaxation;
    });
    groupMentalState.relaxation /= this.participants.length;
    return groupMentalState;
  }

  /**
   * Adds participant to meditation place.
   * @param participant participant socket
   * @return place id
   */
  addParticipant(participant: ParticipantSocket): number {
    const allPlaces = [0, 3, 1, 4, 2, 5];
    const placesInUse = this.participants.map(participant => participant.participant.placeId);
    const remainingPlaces = allPlaces.filter(placeId => !placesInUse.includes(placeId));
    const placeId = remainingPlaces[0];
    this.participants.push(participant);
    return placeId;
  }

  /**
   * Remove participant from meditation place.
   * @param participantToRemove participant socket
   * @return place id
   */
  removeParticipant(participantToRemove: ParticipantSocket) {
    const index = this.participants.findIndex(participant => participant === participantToRemove);
    if (index !== -1) {
      this.participants.splice(index, 1);
    }
  }

  /**
   * Checks if group is full.
   * @return true iff group has 6 participants.
   */
  isFull(): boolean {
    return this.participants.length === 6;
  }

  /**
   * Checks if group is empty.
   * @return true iff group has no participants.
   */
  isEmpty(): boolean {
    return this.participants.length === 0;
  }

  /**
   * Returns true if time since start is longer than duration
   * @return true iff time over
   */
  timeIsOver() {
    const now = new Date();
    const timeElapsed = (now.getTime() - this.started.getTime()) / 60000;
    return timeElapsed > this.duration;
  }

  /**
   * Checks if nickname is already in use.
   * @param nickname nickname to check
   * @return true iff nickname exists
   */
  nicknameAlreadyExists(nickname: string): boolean {
    for (const participant of this.participants) {
      if (participant.participant.nickname === nickname) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if participant is group leader.
   */
  isGroupLeader(socket: ParticipantSocket): boolean {
    return this.participants[0] === socket;
  }
}

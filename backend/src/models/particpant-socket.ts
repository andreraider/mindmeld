import { Socket } from 'socket.io';
import { MentalState } from './mental-state';
import { Participant } from '../entities/participant.entity';

/**
 * Extends socket.io socket by custom members.
 */
export interface ParticipantSocket extends Socket {

  /** participant database entity */
  participant: Participant;

  /** current mental state */
  mentalState: MentalState;

  /** group name */
  groupName: string;
}

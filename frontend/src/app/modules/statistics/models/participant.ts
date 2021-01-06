import {MentalState} from './mental-state';
import {Posture} from './posture';

export class Participant {
  id: number;
  nickname: string;
  posture: Posture;
  placeId: number;
  created: Date;
  leftGroup: Date;
  mentalStates: MentalState[];

  constructor(rawParticipant: Partial<Participant>) {
    Object.assign(this, rawParticipant);
    if (rawParticipant.mentalStates) {
      this.mentalStates = rawParticipant.mentalStates.map(mentalState => new MentalState(mentalState));
    }
  }
}

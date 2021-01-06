import {Theme} from './theme';
import {Participant} from './participant';
import {MentalState} from './mental-state';

export class Statistic {
  id: number;
  name: string;
  participants: Participant[];
  mentalStates: MentalState[];
  theme: Theme;
  duration: number;
  created: Date;
  started: Date;
  ended: Date;

  constructor(rawStatistic: Partial<Statistic>) {
    Object.assign(this, rawStatistic);
    if (rawStatistic.created !== null) {
      this.created = new Date(rawStatistic.created);
    }
    if (rawStatistic.started !== null) {
      this.started = new Date(rawStatistic.started);
    }
    if (rawStatistic.ended !== null) {
      this.ended = new Date(rawStatistic.ended);
    }
    if (this.participants) {
      this.participants = rawStatistic.participants.map(participant => new Participant(participant));
    }
    if (rawStatistic.mentalStates) {
      this.mentalStates = rawStatistic.mentalStates.map(mentalState => new MentalState(mentalState));
    }
  }
}

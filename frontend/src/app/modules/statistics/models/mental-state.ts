export class MentalState {
  readonly created: Date;
  readonly relaxation: number;
  readonly active: boolean;

  constructor(rawMentalState: Partial<MentalState>) {
    Object.assign(this, rawMentalState);
    if (rawMentalState.created) {
      this.created = new Date(rawMentalState.created);
    }
  }
}

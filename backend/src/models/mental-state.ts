/**
 * Mental state for participant.
 */
export class MentalState {

  /** True if participant has HMD on */
  active: boolean;

  /** relaxation mind index [0,1] */
  relaxation: number;

  constructor() {
    this.active = false;
    this.relaxation = 0;
  }
}

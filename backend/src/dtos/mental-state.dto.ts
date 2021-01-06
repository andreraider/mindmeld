import { MentalState } from '../entities/mentalState.entity';

export class MentalStateDto {
  created: Date;
  active: boolean;
  relaxation: number;

  static fromEntity(mentalState: MentalState): MentalStateDto {
    const dto = new MentalStateDto();
    dto.active = mentalState.active;
    dto.relaxation = mentalState.relaxation;
    dto.created = mentalState.created;
    return dto;
  }
}

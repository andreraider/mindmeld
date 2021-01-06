import { Participant } from '../entities/participant.entity';
import { Posture } from '../models/posture';
import { MentalStateDto } from './mental-state.dto';

export class ParticipantStatisticsDto {
  id: number;
  nickname: string;
  posture: Posture;
  placeId: number;
  created: Date;
  leftGroup: Date;
  mentalStates: MentalStateDto[]

  static fromEntity(participant: Participant): ParticipantStatisticsDto {
    const dto = new ParticipantStatisticsDto();
    dto.id = participant.id;
    dto.nickname = participant.nickname;
    dto.posture = participant.posture;
    dto.placeId = participant.placeId
    dto.created = participant.created;
    dto.leftGroup = participant.leftGroup;
    if (participant.mentalStates) {
      dto.mentalStates = participant.mentalStates.map(mentalState => MentalStateDto.fromEntity(mentalState))
    }
    return dto;
  }
}

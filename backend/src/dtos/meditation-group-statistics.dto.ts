import { MeditationGroup } from '../entities/meditation-group.entity';
import { ParticipantStatisticsDto } from './participant-statistics.dto';
import { MentalStateDto } from './mental-state.dto';

export class MeditationGroupStatisticsDto {
  id: number;
  name: string;
  participants: ParticipantStatisticsDto[];
  mentalStates: MentalStateDto[];
  duration: number;
  created: Date;
  started: Date;
  ended: Date;

  static fromEntity(group: MeditationGroup): MeditationGroupStatisticsDto {
    const dto = new MeditationGroupStatisticsDto();
    dto.id = group.id;
    dto.name = group.name;
    dto.created = group.created;
    dto.started = group.started;
    dto.ended = group.ended;
    dto.duration = group.duration;
    if (group.participants) {
      dto.participants = group.participants.map(participant => ParticipantStatisticsDto.fromEntity(participant))
    }
    if (group.mentalStates) {
      dto.mentalStates = group.mentalStates.map(mentalState => MentalStateDto.fromEntity(mentalState));
    }
    return dto;
  }
}

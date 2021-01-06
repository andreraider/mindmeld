import { ParticipantDto } from './participant.dto';
import { MeditationGroup } from '../models/meditation-group';

export class MeditationGroupDto {
  name: string;
  participants: ParticipantDto[];
  started: boolean;
  duration: number;

  static fromModel(group: MeditationGroup): MeditationGroupDto {
    const dto = new MeditationGroupDto();
    dto.name = group.name;
    dto.participants = group.participants.map(participant => ParticipantDto.fromSocket(participant));
    dto.started = group.started !== null;
    dto.duration = group.duration;
    return dto;
  }
}

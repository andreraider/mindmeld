import { ParticipantDto } from './participant.dto';

export class JoinGroupDto {
  readonly groupName: string;
  readonly participant: ParticipantDto;
}

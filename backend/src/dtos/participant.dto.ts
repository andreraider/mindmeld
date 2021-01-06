import { ParticipantSocket } from '../models/particpant-socket';

export class ParticipantDto {
  nickname: string;
  posture: string;
  placeId: number;
  active: boolean;

  static fromSocket(socket: ParticipantSocket): ParticipantDto {
    const participantDto = new ParticipantDto();
    participantDto.nickname = socket.participant.nickname;
    participantDto.posture = socket.participant.posture.toString();
    participantDto.placeId = socket.participant.placeId;
    return participantDto;
  }
}

import { Injectable } from '@nestjs/common';
import { MentalState } from '../entities/mentalState.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipantService } from './participant.service';
import { MentalStateDto } from '../dtos/mental-state.dto';
import { MentalState as MentalStateModel } from '../models/mental-state';

@Injectable()
export class MentalStateService {

  constructor(
    private readonly participantService: ParticipantService,
    @InjectRepository(MentalState) private readonly mentalStateRepository: Repository<MentalState>
  ) { }

  /**
   * Add mental state for participant
   * @param participantId participant to assign mental state to
   * @param mentalStateDto dto
   */
  async addMentalStateForParticipant(participantId: number, mentalStateDto: MentalStateDto): Promise<MentalState> {
    const mentalState = new MentalState();
    mentalState.active = mentalStateDto.active;
    mentalState.relaxation = mentalStateDto.relaxation;
    mentalState.participantId = participantId;
    return this.mentalStateRepository.save(mentalState);
  }

  /**
   * Add mental state for meditation group
   * @param meditationGroupId meditation group to assign mental state to
   * @param mentalStateModel model
   */
  async addMentalStateForMeditationGroup(meditationGroupId: number, mentalStateModel: MentalStateModel): Promise<MentalState> {
    const mentalState = new MentalState();
    mentalState.active = mentalStateModel.active;
    mentalState.relaxation = mentalStateModel.relaxation;
    mentalState.meditationGroupId = meditationGroupId;
    return this.mentalStateRepository.save(mentalState);
  }

  /**
   * Get mental states for participant
   * @param participantId participant to get mental states from
   */
  async getAllMentalStatesForParticipant(participantId: number): Promise<MentalState[]> {
    return this.mentalStateRepository.find({ participantId: participantId });
  }

}

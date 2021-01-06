import { ConflictException, Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { MeditationGroupService } from './services/meditation-group.service';
import { MeditationGroupStatisticsDto } from './dtos/meditation-group-statistics.dto';
import { AuthGuard } from '@nestjs/passport';
import { MentalStateDto } from './dtos/mental-state.dto';
import { MentalStateService } from './services/mental-state.service';

@Controller('statistics')
@UseGuards(AuthGuard('jwt-user'))
export class StatisticsController {

  constructor(
    private readonly meditationGroupService: MeditationGroupService,
    private readonly mentalStateService: MentalStateService
  ) { }

  @Get()
  async getAllGroups(): Promise<MeditationGroupStatisticsDto[]> {
    return (await this.meditationGroupService.getAllMeditationGroups())
      .map(group => MeditationGroupStatisticsDto.fromEntity(group));
  }

  @Get(':id')
  async getGroup(@Param('id') id: string): Promise<MeditationGroupStatisticsDto> {
    return MeditationGroupStatisticsDto.fromEntity(await this.meditationGroupService.getDeepMeditationGroupById(Number(id)));
  }

  @Get(':id/participants/:participantId/mental-states')
  async getMentalStatesForParticipant(@Param('id') id: string, @Param('participantId') participantId: string): Promise<MentalStateDto[]> {
    const meditationGroup = await this.meditationGroupService.getDeepMeditationGroupById(Number(id));

    if (meditationGroup.participants.find(participant => participant.id === Number(participantId))) {
      return (await this.mentalStateService.getAllMentalStatesForParticipant(Number(participantId)))
        .map(mentalState => MentalStateDto.fromEntity(mentalState));

    } else {
      throw new ConflictException();
    }

  }


  @Delete(':id')
  async deleteGroup(@Param('id') id: string): Promise<void> {
    await this.meditationGroupService.removeMeditationGroup(Number(id));
  }

}

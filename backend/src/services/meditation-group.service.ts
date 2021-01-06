import { Injectable } from '@nestjs/common';
import { MeditationGroup } from '../entities/meditation-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeditationGroupDto } from '../dtos/create-meditation-group.dto';

@Injectable()
export class MeditationGroupService {

  constructor(@InjectRepository(MeditationGroup) private readonly meditationGroupRepository: Repository<MeditationGroup>) { }

  /**
   * Creates new meditation group if no active group with same group name exists.
   * @param createMeditationGroupDto dtos
   * @return new meditation group
   */
  async createMeditationGroup(createMeditationGroupDto: CreateMeditationGroupDto): Promise<MeditationGroup> {
    const meditationGroup = new MeditationGroup();
    meditationGroup.name = createMeditationGroupDto.groupName;
    meditationGroup.duration = createMeditationGroupDto.duration;
    return this.meditationGroupRepository.save(meditationGroup);
  }


  /**
   * Returns meditation group by ID.
   * @param id group ID
   */
  async getMeditationGroupById(id: number): Promise<MeditationGroup> {
    return this.meditationGroupRepository.findOneOrFail(id);
  }


  /**
   * Returns all meditation groups
   */
  async getAllMeditationGroups(): Promise<MeditationGroup[]> {
    return this.meditationGroupRepository.find();
  }

  /**
   * Returns all meditation groups
   */
  async getDeepMeditationGroupById(id: number): Promise<MeditationGroup> {
    return this.meditationGroupRepository
      .createQueryBuilder('group')
      .where("group.id = :id", { id })
      .leftJoinAndSelect('group.participants', 'participant')
      .leftJoinAndSelect('group.mentalStates', 'groupMentalState')
      .getOne()
  }

  /**
   * Sets start data for meditation group.
   * @param id group ID
   * @param started date started
   */
  async startMeditationGroup(id: number, started: Date): Promise<MeditationGroup> {
    const meditationGroup = await this.getMeditationGroupById(id);
    meditationGroup.started = started;
    return this.meditationGroupRepository.save(meditationGroup);
  }


  /**
   * Sets end date for meditation group.
   * @param id group ID
   */
  async endMeditationGroup(id: number): Promise<MeditationGroup> {
    const meditationGroup = await this.getMeditationGroupById(id);
    meditationGroup.ended = new Date();
    return this.meditationGroupRepository.save(meditationGroup);
  }


  /**
   * Removes meditation group
   * @param id group ID
   */
  async removeMeditationGroup(id: number): Promise<MeditationGroup> {
    const meditationGroup = await this.getMeditationGroupById(id);
    return this.meditationGroupRepository.remove(meditationGroup);
  }
}

import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { MentalState } from './mentalState.entity';
import { MeditationGroup } from './meditation-group.entity';
import { Posture } from '../models/posture';

@Entity({ orderBy: { id: "ASC" }})
export class Participant {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column({ type: 'int'})
  placeId: number;

  @Column({ type: 'enum', enum: Posture })
  posture: Posture;

  @Column()
  meditationGroupId: number;

  @ManyToOne(type => MeditationGroup, meditationGroup => meditationGroup.participants, { onDelete: 'CASCADE' })
  meditationGroup: MeditationGroup

  @OneToMany(type => MentalState, mentalState => mentalState.participant)
  mentalStates: MentalState[];

  @Column({ default: null })
  leftGroup: Date;

  @CreateDateColumn()
  created: Date;
}

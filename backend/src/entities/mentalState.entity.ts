import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Participant } from './participant.entity';
import { MeditationGroup } from './meditation-group.entity';

@Entity({ orderBy: { id: "ASC" }})
export class MentalState {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: null })
  active: boolean;

  @Column({ type: 'float'})
  relaxation: number;

  @Column({ nullable: true })
  participantId: number;

  @ManyToOne(type => Participant, participant => participant.mentalStates, { nullable: true, onDelete: 'CASCADE' })
  participant: Participant

  @Column({ nullable: true })
  meditationGroupId: number;

  @ManyToOne(type => MeditationGroup, meditationGroup => meditationGroup.mentalStates, { nullable: true, onDelete: 'CASCADE' })
  meditationGroup: MeditationGroup

  @CreateDateColumn({ default: null })
  created: Date;
}

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Participant } from './participant.entity';
import { MentalState } from './mentalState.entity';

@Entity({ orderBy: { id: "DESC" }})
export class MeditationGroup {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  duration: number;

  @OneToMany(type => Participant, participant => participant.meditationGroup)
  participants: Participant[];

  @OneToMany(type => MentalState, mentalState => mentalState.meditationGroup)
  mentalStates: MentalState[];

  @Column({ default: null })
  started: Date;

  @Column({ default: null })
  ended: Date;

  @CreateDateColumn()
  created: Date;
}

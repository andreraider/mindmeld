import { Module } from '@nestjs/common';
import { UnityGateway } from './unity.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MeditationGroupService } from './services/meditation-group.service';
import { ParticipantService } from './services/participant.service';
import { MentalStateService } from './services/mental-state.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeditationGroup } from './entities/meditation-group.entity';
import { Participant } from './entities/participant.entity';
import { MentalState } from './entities/mentalState.entity';
import { StatisticsController } from './statistics.controller';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: Number(configService.get('DATABASE_PORT')),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          MeditationGroup,
          Participant,
          MentalState,
          User
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([MeditationGroup, Participant, MentalState]),
    ScheduleModule.forRoot(),
    AuthModule
  ],
  providers: [
    UnityGateway,
    MeditationGroupService,
    ParticipantService,
    MentalStateService
  ],
  controllers: [StatisticsController],
})
export class AppModule {}

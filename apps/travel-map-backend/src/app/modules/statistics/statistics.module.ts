import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from '../routers/entities/route.entity';
import { User } from '../users/entities/user.entity';
import { Level } from './entities/level.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Route, Level])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

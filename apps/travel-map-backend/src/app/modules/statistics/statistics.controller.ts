import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Level } from './entities/level.entity';
import { LeaderboardTrip } from './interfaces/leaderboard-trip.interface';
import { LeaderboardUser } from './interfaces/leaderboard-user.interface';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('users')
  public async getLeaderboard(): Promise<LeaderboardUser[]> {
    return this.statisticsService.getTopUsersByTripPoints();
  }

  @Get('trips')
  public async getTopTrips(): Promise<LeaderboardTrip[]> {
    return this.statisticsService.getTopTripsByPoints();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  public async getDashboardStats(@Request() req): Promise<DashboardStatsDto> {
    return this.statisticsService.getUserDashboardStats(req.user.userId);
  }

  @Get('levels')
  public async getLevels(): Promise<Level[]> {
    return this.statisticsService.getAllLevels();
  }
}

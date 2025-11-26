import { Controller, Get } from '@nestjs/common';
import { LeaderboardTrip } from './interfaces/leaderboard-trip.interface';
import { LeaderboardUser } from './interfaces/leaderboard-user.interface';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('users')
  public async getLeaderboard(): Promise<LeaderboardUser[]> {
    return this.leaderboardService.getTopUsersByTripPoints();
  }

  @Get('trips')
  public async getTopTrips(): Promise<LeaderboardTrip[]> {
    return this.leaderboardService.getTopTripsByPoints();
  }
}

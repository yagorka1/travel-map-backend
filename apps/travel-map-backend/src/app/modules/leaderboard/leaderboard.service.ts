import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../routers/entities/route.entity';
import { User } from '../users/entities/user.entity';
import { LeaderboardTrip } from './interfaces/leaderboard-trip.interface';
import { LeaderboardUser } from './interfaces/leaderboard-user.interface';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  public async getTopUsersByTripPoints(): Promise<LeaderboardUser[]> {
    const users: User[] = await this.usersRepository.find();
    const routes: Route[] = await this.routesRepository.find();

    const usersWithPoints = users.map((user) => {
      const userRoutes = routes.filter((route) => route.userId === user.id);
      const points = userRoutes.reduce((sum, route) => sum + route.pointsEarned, 0);

      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        points,
        tripsCount: userRoutes.length,
      };
    });

    return usersWithPoints.sort((a, b) => b.points - a.points);
  }

  public async getTopTripsByPoints(): Promise<LeaderboardTrip[]> {
    const routes: Route[] = await this.routesRepository.find();
    const users: User[] = await this.usersRepository.find();

    const userMap = new Map(users.map((user) => [user.id, user]));

    return routes
      .map((route) => {
        const user = userMap.get(route.userId);
        return {
          id: route.id,
          name: route.name,
          distance: route.distance,
          points: route.pointsEarned,
          startDate: route.startDate,
          endDate: route.endDate,
          userId: route.userId,
          userName: user?.name || 'Unknown User',
        };
      })
      .sort((a, b) => b.points - a.points);
  }
}

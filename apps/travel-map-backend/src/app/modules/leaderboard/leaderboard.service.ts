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

    const usersWithPoints: LeaderboardUser[] = users.map((user: User) => {
      const userRoutes: Route[] = routes.filter((route: Route) => route.userId === user.id);
      const points: number = userRoutes.reduce((sum: number, route: Route) => sum + route.pointsEarned, 0);

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

    const userMap: Map<string, User> = new Map(users.map((user: User) => [user.id, user]));

    return routes
      .map((route: Route) => {
        const user: User | undefined = userMap.get(route.userId);
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../routers/entities/route.entity';
import { User } from '../users/entities/user.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Level } from './entities/level.entity';
import { LeaderboardTrip } from './interfaces/leaderboard-trip.interface';
import { LeaderboardUser } from './interfaces/leaderboard-user.interface';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    @InjectRepository(Level)
    private levelsRepository: Repository<Level>,
  ) {}

  public async getAllLevels(): Promise<Level[]> {
    return this.levelsRepository.find({ order: { minPoints: 'ASC' } });
  }

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

  public async getUserDashboardStats(userId: string): Promise<DashboardStatsDto> {
    const routes: Route[] = await this.routesRepository.find({
      where: { userId },
    });

    const totalTrips: number = routes.length;
    const totalDistance: number = routes.reduce((sum, route) => sum + route.distance, 0);
    const totalPoints: number = routes.reduce((sum, route) => sum + route.pointsEarned, 0);

    const citiesSet: Set<string> = new Set<string>();
    const countriesSet: Set<string> = new Set<string>();
    const cityCountMap: Map<string, number> = new Map<string, number>();
    const countryCountMap: Map<string, number> = new Map<string, number>();

    let totalDurationMs = 0;

    routes.forEach((route: Route) => {
      const start: number = new Date(route.startDate).getTime();
      const end: number = new Date(route.endDate).getTime();
      totalDurationMs += end - start;

      route.cities?.forEach((city: string) => {
        citiesSet.add(city);
        cityCountMap.set(city, (cityCountMap.get(city) || 0) + 1);
      });

      route.countries?.forEach((country: string) => {
        countriesSet.add(country);
        countryCountMap.set(country, (countryCountMap.get(country) || 0) + 1);
      });
    });

    const averageTripDuration: number =
      totalTrips > 0 ? totalDurationMs / totalTrips / (1000 * 60 * 60 * 24) : 0;

    const mostVisitedCity: { name: string; count: number } = this.getMostVisited(cityCountMap);
    const mostVisitedCountry: { name: string; count: number } = this.getMostVisited(countryCountMap);

    const { currentLevel, nextLevel } = await this.calculateUserLevel(totalPoints);

    return {
      totalTrips,
      totalDistance,
      visitedCities: citiesSet.size,
      visitedCountries: countriesSet.size,
      mostVisitedCity,
      mostVisitedCountry,
      averageTripDuration: Number(averageTripDuration.toFixed(2)),
      totalPoints,
      level: currentLevel,
      nextLevel,
      visitedCountriesList: Array.from(countriesSet),
    };
  }

  private async calculateUserLevel(points: number): Promise<{ currentLevel: Level; nextLevel: Level | null }> {
    const levels = await this.getAllLevels();
    let currentLevel = levels[0];
    let nextLevel: Level | null = null;

    for (let i = 0; i < levels.length; i++) {
      if (points >= levels[i].minPoints) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
      } else {
        break;
      }
    }

    return { currentLevel, nextLevel };
  }

  private getMostVisited(countMap: Map<string, number>): { name: string; count: number } {
    let mostVisited: { name: string; count: number } = { name: '', count: 0 };
    countMap.forEach((count, name) => {
      if (count > mostVisited.count) {
        mostVisited = { name, count };
      }
    });
    return mostVisited;
  }
}

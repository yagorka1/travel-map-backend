import { Level } from '../entities/level.entity';

export class MostVisitedLocationDto {
  name: string;
  count: number;
}

export class DashboardStatsDto {
  totalTrips: number;
  totalDistance: number;
  visitedCities: number;
  visitedCountries: number;
  mostVisitedCity: MostVisitedLocationDto;
  mostVisitedCountry: MostVisitedLocationDto;
  averageTripDuration: number;
  totalPoints: number;
  level: Level;
  nextLevel: Level | null;
}

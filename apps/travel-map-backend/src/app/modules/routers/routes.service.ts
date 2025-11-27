import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getDistance } from 'geolib';
import { Repository } from 'typeorm';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { GEOMETRY_TYPE_LINESTRING } from './constants/geo.constants';
import {
  POINTS_NEW_CITY,
  POINTS_NEW_COUNTRY,
  POINTS_VISITED_CITY,
  POINTS_VISITED_COUNTRY,
} from './constants/points.constants';
import { CreateRouteDto } from './dto/create-route.dto';
import { Route } from './entities/route.entity';
import { GeoService } from './services/geo.service';
import { GeocodingResult, GeoJsonGeometry, Point } from './types/route.types';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    private geoService: GeoService,
  ) {}

  /**
   * Creates a new route for a user.
   * Calculates distance, identifies countries and cities along the route,
   * and assigns points based on new vs. visited locations.
   *
   * @param userId - ID of the user creating the route
   * @param dto - Route creation data
   * @returns The created route entity
   * @throws HttpException if route creation fails
   */
  async createRoute(userId: string, dto: CreateRouteDto): Promise<Route> {
     try {
      const distance: number = this.calculateDistance(dto.points);

      const countriesSet: Set<string> = new Set<string>();
      const citiesSet: Set<string> = new Set<string>();

      for (const p of dto.points) {
        const data: GeocodingResult = await this.geoService.reverseGeocode(p.lat, p.lng);
        if (data.country) countriesSet.add(data.country);
        if (data.city) citiesSet.add(data.city);
      }

      const countries: string[] = Array.from(countriesSet);
      const cities: string[] = Array.from(citiesSet);

      const prevRoutes: Route[] = await this.getUserRoutes(userId);

      const earned: number = this.calculatePoints(countries, cities, prevRoutes);

      const geometry: GeoJsonGeometry = {
        type: GEOMETRY_TYPE_LINESTRING,
        coordinates: dto.points.map((p) => [p.lng, p.lat]),
      };

      return await this.routeRepository.save({
        userId,
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        geometry,
        distance,
        pointsEarned: earned,
        color: dto.color,
        countries,
        cities,
      });
    } catch (err) {
      console.error(err);
      throw new HttpException(
        { errorCode: ErrorsEnum.INTERNAL_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Calculates the total distance of a route in meters.
   * Uses the Haversine formula via geolib to calculate distances between consecutive points.
   *
   * @param points - Array of geographic points defining the route
   * @returns Total distance in meters
   */
  public calculateDistance(points: Point[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += getDistance(points[i - 1], points[i]);
    }
    return total;
  }

  /**
   * Calculates points earned for a route based on visited countries and cities.
   * Awards more points for first-time visits than repeat visits.
   *
   * @param countries - List of countries visited in this route
   * @param cities - List of cities visited in this route
   * @param prevRoutes - User's previous routes to check for repeat visits
   * @returns Total points earned for this route
   */
  public calculatePoints(
    countries: string[],
    cities: string[],
    prevRoutes: Route[],
  ): number {
    const prevCountries = new Set(prevRoutes.flatMap((r) => r.countries));
    const prevCities = new Set(prevRoutes.flatMap((r) => r.cities));

    let points = 0;

    for (const c of countries) {
      if (!prevCountries.has(c)) {
        points += POINTS_NEW_COUNTRY;
      } else {
        points += POINTS_VISITED_COUNTRY;
      }
    }

    for (const c of cities) {
      if (!prevCities.has(c)) {
        points += POINTS_NEW_CITY;
      } else {
        points += POINTS_VISITED_CITY;
      }
    }

    return points;
  }

  public async getUserRoutes(userId: string): Promise<Route[]> {
    return this.routeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async getRouteById(routeId: string): Promise<Route | null> {
    return this.routeRepository.findOne({
      where: { id: routeId },
    });
  }
}


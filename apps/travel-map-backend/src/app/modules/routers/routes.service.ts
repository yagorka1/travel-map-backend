import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getDistance } from 'geolib';
import { Route } from "./entities/route.entity";
import { CreateRouteDto } from "./dto/create-route.dto";
import { ErrorsEnum } from "../core/enums/errors.enum";
import { GeoService } from './services/geo.service';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    private geoService: GeoService,
  ) {}

  async createRoute(userId: string, dto: CreateRouteDto): Promise<Route> {
    try {
      const distance = this.calculateDistance(dto.points);

      const countriesSet = new Set<string>();
      const citiesSet = new Set<string>();

      for (const p of dto.points) {
        const data = await this.geoService.reverseGeocode(p.lat, p.lng);
        if (data.country) countriesSet.add(data.country);
        if (data.city) citiesSet.add(data.city);
      }

      const countries = Array.from(countriesSet);
      const cities = Array.from(citiesSet);

      const prevRoutes = await this.getUserRoutes(userId);

      const earned = this.calculatePoints(countries, cities, prevRoutes);

      const geometry = {
        type: 'LineString',
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

  public calculateDistance(points: CreateRouteDto['points']): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += getDistance(points[i - 1], points[i]);
    }
    return total;
  }

  public calculatePoints(
    countries: string[],
    cities: string[],
    prevRoutes: Route[],
  ): number {
    const prevCountries = new Set(prevRoutes.flatMap(r => r.countries));
    const prevCities = new Set(prevRoutes.flatMap(r => r.cities));

    let points = 0;

    for (const c of countries) {
      if (!prevCountries.has(c)) points += 200;
      else points += 20;
    }

    for (const c of cities) {
      if (!prevCities.has(c)) points += 30;
      else points += 5;
    }

    return points;
  }

  public async getUserRoutes(userId: string): Promise<Route[]> {
    return this.routeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async getRouteById(routeId: string): Promise<Route> {
    return this.routeRepository.findOne({
      where: { id: routeId },
    });
  }
}

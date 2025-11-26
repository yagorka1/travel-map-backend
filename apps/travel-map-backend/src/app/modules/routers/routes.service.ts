import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getDistance } from 'geolib';
import { Route } from "./entities/route.entity";
import { CreateRouteDto } from "./dto/create-route.dto";
import { ErrorsEnum } from "../core/enums/errors.enum";

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async createRoute(userId: string, dto: CreateRouteDto): Promise<Route> {
  try {
    const distance = this.calculateDistance(dto.points);
    const earned = this.calculatePoints(distance);

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

  public calculatePoints(distance: number): number {
    if (distance < 1000) return 5;
    if (distance < 5000) return 10;
    if (distance < 20000) return 20;
    return 30;
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
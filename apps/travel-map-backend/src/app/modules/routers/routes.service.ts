import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getDistance } from 'geolib';
import { Route } from "./entities/route.entity";
import { CreateRouteDto } from "./dto/create-route.dto";

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>
  ) {}

  public calculateDistance(points: CreateRouteDto['points']): number {
    let total = 0;

    for (let i = 1; i < points.length; i++) {
      total += getDistance(points[i - 1], points[i]);
    }

    return total; // meters
  }

  public calculatePoints(distance: number): number { // ToDo implement points system 
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
}
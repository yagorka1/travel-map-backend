import { Body, Controller, Post, Request, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Route } from "./entities/route.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ErrorsEnum } from "../core/enums/errors.enum";

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService, @InjectRepository(Route) private routesRepository: Repository<Route>) {}

  @Post('/create')
  public async createRoute(
    @Request() req,
    @Body() dto: { name: string; description?: string; points: any[] }
  ) {
    try {
      const distance = this.routesService.calculateDistance(dto.points);
      const earned = this.routesService.calculatePoints(distance);

      const saved = await this.routesRepository.save({
        userId: req.user.userId,
        name: dto.name,
        description: dto.description,
        geometry: {
          type: 'LineString',
          coordinates: dto.points.map((p) => [p.lng, p.lat]),
        },
        distance,
        pointsEarned: earned,
      });
      return saved;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          errorCode: ErrorsEnum.INTERNAL_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

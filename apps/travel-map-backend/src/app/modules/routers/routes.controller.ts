import { Body, Controller, Post, Request, UseGuards, HttpException, HttpStatus, Get } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Route } from "./entities/route.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ErrorsEnum } from "../core/enums/errors.enum";
import { CreateRouteDto } from "./dto/create-route.dto";

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService, @InjectRepository(Route) private routesRepository: Repository<Route>) {}

  @Post('/create')
  public async createRoute(
    @Request() req,
    @Body() dto: CreateRouteDto
  ): Promise<Route> {
    try {
      const distance = this.routesService.calculateDistance(dto.points);
      const earned = this.routesService.calculatePoints(distance);

      const saved = await this.routesRepository.save({
        userId: req.user.userId,
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
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

  @Get('list')
  public async getUserRoutes(@Request() req): Promise<Route[]> {
    try {
      return await this.routesService.getUserRoutes(req.user.userId);
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

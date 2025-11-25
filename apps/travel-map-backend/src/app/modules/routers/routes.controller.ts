import { Body, Controller, Post, Request, UseGuards, HttpException, HttpStatus, Get } from "@nestjs/common";
import { RoutesService } from "./routes.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ErrorsEnum } from "../core/enums/errors.enum";
import { CreateRouteDto } from "./dto/create-route.dto";
import { Route } from "./entities/route.entity";

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post('/create')
  public async createRoute(
    @Request() req,
    @Body() dto: CreateRouteDto
  ): Promise<Route> {
    return this.routesService.createRoute(req.user.userId, dto);
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

  @Get(':id')
  public async getUserRoute(@Request() req): Promise<Route> {
    try {
      return await this.routesService.getUserRoute(req.user.userId, req.params.id);
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

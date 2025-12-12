import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { AuthenticatedRequest } from '../core/types/request.types';
import { CreateRouteDto } from './dto/create-route.dto';
import { Route } from './entities/route.entity';
import { RoutesService } from './routes.service';

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post('/create')
  public async createRoute(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateRouteDto
  ): Promise<Route> {
    return this.routesService.createRoute(req.user.userId, dto);
  }

  @Get('list')
  public async getUserRoutes(
    @Request() req: AuthenticatedRequest
  ): Promise<Route[]> {
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
  public async getUserRoute(@Param('id') id: string): Promise<Route | null> {
    try {
      return await this.routesService.getRouteById(id);
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

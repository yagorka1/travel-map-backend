import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Route } from "./entities/route.entity";
import { RoutesService } from "./routes.service";
import { RoutesController } from "./routes.controller";
import { GeoService } from './services/geo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RoutesController],
  providers: [RoutesService, GeoService],
  exports: [RoutesService],
})
export class RoutesModule {}

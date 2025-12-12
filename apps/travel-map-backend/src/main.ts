import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { ErrorsFilter } from './app/modules/core/filters/errors.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new ErrorsFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(
  '/uploads',
  express.static(join(process.cwd(), 'uploads'))
);

  const port = process.env.PORT || 3000;

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

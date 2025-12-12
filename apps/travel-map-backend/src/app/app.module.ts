import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatMember } from './modules/chats/entities/chat-member.entity';
import { Chat } from './modules/chats/entities/chat.entity';
import { Message } from './modules/chats/entities/message.entity';
import { Route } from './modules/routers/entities/route.entity';
import { RoutesModule } from './modules/routers/routes.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { User } from './modules/users/entities/user.entity';
import { UsersModule } from './modules/users/users.module';

import { Level } from './modules/statistics/entities/level.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ChatsModule,
    RoutesModule,
    StatisticsModule,
ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'myuser',
        password: configService.get<string>('DB_PASSWORD') || 'password',
        database: configService.get<string>('DB_NAME') || 'travelmap',
        entities: [User, Chat, ChatMember, Message, Route, Level],
        synchronize: true,
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

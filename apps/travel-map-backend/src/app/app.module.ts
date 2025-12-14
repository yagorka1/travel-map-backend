import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChatsModule } from './modules/chats/chats.module';
import { RoutesModule } from './modules/routers/routes.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

import { User } from './modules/users/entities/user.entity';
import { Chat } from './modules/chats/entities/chat.entity';
import { ChatMember } from './modules/chats/entities/chat-member.entity';
import { Message } from './modules/chats/entities/message.entity';
import { Route } from './modules/routers/entities/route.entity';
import { Level } from './modules/statistics/entities/level.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        return isProd
          ? {
              type: 'postgres',
              url: config.get<string>('DATABASE_URL'),
              entities: [User, Chat, ChatMember, Message, Route, Level],
              synchronize: false,
              ssl: { rejectUnauthorized: false },
            }
          : {
              type: 'postgres',
              host: config.get('DB_HOST'),
              port: Number(config.get('DB_PORT')),
              username: config.get('DB_USERNAME'),
              password: config.get('DB_PASSWORD'),
              database: config.get('DB_NAME'),
              entities: [User, Chat, ChatMember, Message, Route, Level],
              synchronize: true,
            };
      },
    }),

    AuthModule,
    UsersModule,
    ChatsModule,
    RoutesModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

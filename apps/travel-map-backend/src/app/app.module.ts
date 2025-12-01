import { Module } from '@nestjs/common';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'password',
      database: 'travelmap',
      entities: [User, Chat, ChatMember, Message, Route, Level],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

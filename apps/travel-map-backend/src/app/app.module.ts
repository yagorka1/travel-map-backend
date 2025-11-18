import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { ChatsModule } from './modules/chats/chats.module';
import { Message } from './modules/chats/entities/message.entity';
import { ChatMember } from './modules/chats/entities/chat-member.entity';
import { Chat } from './modules/chats/entities/chat.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ChatsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'password',
      database: 'travelmap',
      entities: [User, Chat, ChatMember, Message],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

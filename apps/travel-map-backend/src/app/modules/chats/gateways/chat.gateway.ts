import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../../auth/types/auth.types';
import { Message } from '../entities/message.entity';
import { WebSocketEvents } from '../enums/web-sockets-events.enum';
import { UnreadResponse } from '../types/chat.types';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private jwt: JwtService) {}

  public handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload: JwtPayload = this.jwt.verify<JwtPayload>(token);
      client.data.user = payload;

      const userId: string = payload.id;

      if (userId) {
        client.join(userId);
        console.log(`✅ Client joined room: ${userId}`);
      } else {
        console.error('❌ No userId found in payload:', payload);
      }
    } catch (err) {
      client.disconnect();
    }
  }

  @SubscribeMessage('join')
  public handleJoin(@MessageBody() chatId: string, @ConnectedSocket() client: Socket): void {
    client.join(chatId);
  }

  public sendNewMessage(chatId: string, message: Message): void {
    this.server.to(chatId).emit(WebSocketEvents.NEW_MESSAGE, message);
  }

  public sendUnread(userId: string, payload: UnreadResponse): void {
    this.server.to(userId).emit(WebSocketEvents.UNREAD_COUNT, payload);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WebSocketEvents } from '../enums/web-sockets-events.enum';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private jwt: JwtService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwt.verify(token);
      client.data.user = payload;

      const userId = payload.id;

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
  handleJoin(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
  }

  public sendNewMessage(chatId: string, message: any) {
    this.server.to(chatId).emit(WebSocketEvents.NEW_MESSAGE, message);
  }

  public sendUnread(userId: string, payload: any) {
    this.server.to(userId).emit(WebSocketEvents.UNREAD_COUNT, payload);
  }
}

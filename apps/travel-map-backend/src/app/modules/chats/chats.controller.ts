import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../core/types/request.types';
import { UserChatDto } from '../users/dto/user-chat.dto';
import { ChatsService } from './chats.service';
import { ChatMember } from './entities/chat-member.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { UnreadResponse, UserChatInfo } from './types/chat.types';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chatService: ChatsService) {}

  @Post('create')
  public createChat(
    @Body() body: { name: string; ownerId: string; membersIds: string[] }
  ): Promise<Chat> {
    return this.chatService.createChat(body);
  }

  @Post('send-message')
  public async sendMessage(
    @Body()
    body: {
      content: string;
      receiverId: string;
      senderId: string;
      chatId?: string;
    }
  ): Promise<Message> {
    return await this.chatService.sendMessage(
      body.content,
      body.receiverId,
      body.senderId,
      body.chatId
    );
  }

  @Post(':chatId/add-user')
  public addUser(
    @Param('chatId') chatId: string,
    @Body() body: { userId: string; role?: string }
  ): Promise<ChatMember> {
    return this.chatService.addUserToChat(chatId, body.userId, body.role);
  }

  @Get('list')
  public getUserChats(@Request() req: AuthenticatedRequest): Promise<UserChatInfo[]> {
    const userId: string = req.user.userId;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/members')
  public getMembers(@Param('chatId') chatId: string): Promise<ChatMember[]> {
    return this.chatService.getChatMembers(chatId);
  }

  @Get('available-users')
  public getAvailableUsers(@Request() req: AuthenticatedRequest): Promise<UserChatDto[]> {
    const userId: string = req.user.userId;
    return this.chatService.getAvailableUsers(userId);
  }

  @Get('messages/:chatId')
  public getMessages(@Param('chatId') chatId: string): Promise<Message[]> {
    return this.chatService.getMessages(chatId);
  }

  @Post(':chatId/read')
  public async markAsRead(
    @Param('chatId') chatId: string,
    @Request() req: AuthenticatedRequest
  ): Promise<void> {
    return this.chatService.markChatAsRead(chatId, req.user.userId);
  }

  @Get('unread-messages')
  public getUnreadMessages(@Request() req: AuthenticatedRequest): Promise<UnreadResponse> {
    const userId: string = req.user.userId;
    return this.chatService.getUnreadForUser(userId);
  }
}

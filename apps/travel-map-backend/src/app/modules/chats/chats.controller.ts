import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private chatService: ChatsService) {}

  @Post('create')
  public createChat(
    @Body() body: { name: string; ownerId: string; membersIds: string[] }
  ) {
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
  ) {
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
  ) {
    return this.chatService.addUserToChat(chatId, body.userId, body.role);
  }

  @Get('list')
  public getUserChats(@Request() req: any) {
    const userId = req.user.userId;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/members')
  public getMembers(@Param('chatId') chatId: string) {
    return this.chatService.getChatMembers(chatId);
  }

  @Get('available-users')
  public getAvailableUsers(@Request() req: any) {
    const userId = req.user.userId;
    return this.chatService.getAvailableUsers(userId);
  }

  @Get('messages/:chatId')
  public getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(chatId);
  }

  @Post(':chatId/read')
  public async markAsRead(
    @Param('chatId') chatId: string,
    @Request() req: any
  ) {
    return this.chatService.markChatAsRead(chatId, req.user.userId);
  }

  @Get('unread-messages')
  public getUnreadMessages(@Request() req: any) {
    const userId = req.user.userId;
    return this.chatService.getUnreadForUser(userId);
  }
}

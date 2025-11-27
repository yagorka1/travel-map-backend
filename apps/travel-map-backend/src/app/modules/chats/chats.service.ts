import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserChatDto } from '../users/dto/user-chat.dto';
import { User } from '../users/entities/user.entity';
import { DEFAULT_CHAT_NAME, DEFAULT_MEMBER_ROLE } from './constants/chat.constants';
import { ChatMember } from './entities/chat-member.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from './gateways/chat.gateway';
import { CreateChatData, UnreadResponse, UserChatInfo } from './types/chat.types';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,

    @InjectRepository(ChatMember)
    private memberRepo: Repository<ChatMember>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly chatGateway: ChatGateway
  ) {}

  public async createChat(data: CreateChatData): Promise<Chat> {
    const chat: Chat = this.chatRepo.create({ name: data.name });
    await this.chatRepo.save(chat);

    const members: ChatMember[] = data.membersIds.map((userId) =>
      this.memberRepo.create({
        user: { id: userId },
        chat,
      })
    );

    await this.memberRepo.save(members);

    return chat;
  }

  public async addUserToChat(chatId: string, userId: string, role = DEFAULT_MEMBER_ROLE): Promise<ChatMember> {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!chat || !user) throw new Error('Chat or User not found');

    const member = this.memberRepo.create({ chat, user, role });
    return this.memberRepo.save(member);
  }

  public async getUserChats(userId: string): Promise<UserChatInfo[]> {
    if (!this.memberRepo) {
      return [];
    }

    const members: ChatMember[] =
      (await this.memberRepo?.find({
        where: { user: { id: userId } },
        relations: ['chat', 'chat.members', 'chat.members.user'],
      })) || [];

    return members?.map((m) => {
      const otherMember = m.chat.members.find(
        (member) => member.user.id !== userId
      );

      return {
        chat: { id: m.chat.id, name: m.chat.name },
        user: otherMember
          ? {
              id: otherMember.user.id,
              name: otherMember.user.name,
              email: otherMember.user.email,
              avatarUrl: otherMember.user.avatarUrl,
            }
          : null,
      };
    });
  }

  public async getChatMembers(chatId: string): Promise<ChatMember[]> {
    return this.memberRepo.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });
  }

  public async getAvailableUsers(currentUserId: string): Promise<UserChatDto[]> {
    if (!currentUserId) throw new Error('currentUserId is required');

    const users: User[] = await this.userRepo.find({
      where: {
        id: Not(currentUserId),
      },
    });

    return users.map(
      (user) =>
        new UserChatDto({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        })
    );
  }

  public async sendMessage(
    content: string,
    receiverId: string,
    senderId: string,
    chatId: string | undefined,
  ): Promise<Message> {
    try {
      if (!content || !receiverId || !senderId) {
        throw new Error('Missing required fields: content, receiverId, senderId');
      }

      let chat: Chat | null = null;

      if (!chatId) {
        chat = await this.createChat({
          name: DEFAULT_CHAT_NAME,
          ownerId: senderId,
          membersIds: [senderId, receiverId],
        });

        if (!chat) {
          throw new Error('Failed to create chat');
        }
      } else {
        chat = await this.chatRepo.findOne({
          where: { id: chatId },
          relations: ['members', 'members.user'],
        });

        if (!chat) {
          throw new Error(`Chat with id ${chatId} not found`);
        }
      }

      const sender: User | null = await this.userRepo.findOne({ where: { id: senderId } });
      if (!sender) {
        throw new Error(`Sender user with id ${senderId} not found`);
      }

      const message: Message = this.messageRepo.create({
        chat,
        chatId: chat.id,
        sender,
        senderId: sender.id,
        content,
      });

      const savedMessage: Message = await this.messageRepo.save(message);
      if (!savedMessage) {
        throw new Error('Failed to save message');
      }



      try {
        for (const m of chat.members) {
          if (m.user.id !== senderId) {
            await this.emitUnreadCount(m.user.id);
          }
        }
      } catch (err) {
        console.error('Error while emitting unread count:', err);
      }

      try {
        this.chatGateway.sendNewMessage(chat.id, savedMessage);
      } catch (err) {
        console.error('WebSocket sendNewMessage error:', err);
      }

      console.log('New message created:', message.id, message.created_at);

      const members: ChatMember[] = await this.memberRepo.find({ where: { chat: { id: chatId } } });
      for (const member of members) {
        console.log('member.readAt:', member.readAt);
        const unread = message.created_at > (member.readAt || new Date(0));
        console.log('Unread?', unread, 'for member', member.id);
      }

      return savedMessage;
    } catch (error) {
      console.error('sendMessage error:', error);

      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
  public async getMessages(chatId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      relations: ['chat', 'sender'],
      select: {
        sender: { id: true, name: true, email: true, avatarUrl: true },
      },
      order: { created_at: 'ASC' },
    });
  }

  public async markChatAsRead(chatId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
    });

    if (!member) return;

    member.readAt = new Date();
    await this.memberRepo.save(member);

    await this.emitUnreadCount(userId);
  }

  public async getUnreadForUser(userId: string): Promise<UnreadResponse> {
    const members: ChatMember[] = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['chat', 'chat.messages', 'chat.messages.sender'],
    });

    const result: Array<{
      chatId: string;
      unreadCount: number;
      lastMessage: Message | null;
    }> = [];

    let totalUnread = 0;

    for (const member of members) {
      const { chat, readAt } = member;

      const sortedMessages = [...chat.messages].sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      );

      const lastMessage = sortedMessages[0] ?? null;

      const lastReadTime = readAt ? new Date(readAt).getTime() : 0;

      const unread = sortedMessages.filter(m => {
        const senderId = m.sender?.id ?? m.senderId;

        if (!senderId) return false;

        const messageTime = new Date(m.created_at).getTime();

        return senderId !== userId && messageTime > lastReadTime;
      }).length;

      totalUnread += unread;

      result.push({
        chatId: chat.id,
        unreadCount: unread,
        lastMessage,
      });
    }

    return {
      totalUnread,
      chats: result,
    };
  }

  private async emitUnreadCount(userId: string): Promise<void> {
    const unread = await this.getUnreadForUser(userId);
    this.chatGateway.sendUnread(userId, unread);
  }
}

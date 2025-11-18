import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Not, Repository } from 'typeorm';
import { ChatMember } from './entities/chat-member.entity';
import { User } from '../users/entities/user.entity';
import { UserChatDto } from '../users/dto/user-chat.dto';
import { Message } from './entities/message.entity';
import { ChatGateway } from './gateways/chat.gateway';

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
    private readonly chatGateway: ChatGateway,
  ) {}

  public async createChat(data: { name: string; ownerId: string, membersIds: string[] }) {
    const chat: Chat = this.chatRepo.create({ name: data.name });
    await this.chatRepo.save(chat);

    const members: ChatMember[] = data.membersIds.map(userId =>
      this.memberRepo.create({
        user: { id: userId },
        chat,
      }),
    );

    await this.memberRepo.save(members);

    return chat;
  }

  public async addUserToChat(chatId: string, userId: string, role = 'member') {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!chat || !user) throw new Error('Chat or User not found');

    const member = this.memberRepo.create({ chat, user, role });
    return this.memberRepo.save(member);
  }

  public async getUserChats(userId: string) {
    if (!this.memberRepo) {
      return [];
    }

    const members = await this.memberRepo?.find({
      where: { user: { id: userId } },
      relations: ['chat', 'chat.members', 'chat.members.user'],
    }) || [];

    return members?.map(m => {
      const otherMember = m.chat.members.find(member => member.user.id !== userId);

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

  async getChatMembers(chatId: string) {
    return this.memberRepo.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });
  }

  public async getAvailableUsers(currentUserId: string) {
    if (!currentUserId) throw new Error('currentUserId is required');

    const users = await this.userRepo.find({
      where: {
        id: Not(currentUserId),
      },
    });

    return users.map(user => new UserChatDto({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }));
  }

  public async sendMessage(
    content: string,
    receiverId: string,
    senderId: string,
    chatId: string | undefined,
  ) {
    let chat;

    if (!chatId) {
      chat = await this.createChat({
        name: 'Chat',
        ownerId: senderId,
        membersIds: [senderId, receiverId],
      });
    } else {
      chat = await this.chatRepo?.findOne({ where: { id: chatId }, relations: ['members'] })
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });

    const message = this.messageRepo.create({
      chat,
      chatId: chat.id,
      sender,
      senderId: sender.id,
      content,
    });

    const savedMessage = await this.messageRepo.save(message)

    this.chatGateway.sendNewMessage(chat.id, savedMessage);

    return savedMessage;
  }

  public async getMessages(chatId: string) {
    return this.messageRepo.find({
      where: { chat: { id: chatId } },
      relations: ['chat', 'sender'],
      select: {
        sender: { id: true, name: true, email: true, avatarUrl: true },
      },
      order: { created_at: 'ASC' },
    });
  }
}

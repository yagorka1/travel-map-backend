import { Message } from '../entities/message.entity';

export interface ChatMemberInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface UserChatInfo {
  chat: {
    id: string;
    name: string;
  };
  user: ChatMemberInfo | null;
}

export interface UnreadInfo {
  chatId: string;
  unreadCount: number;
  lastMessage: Message | null;
}

export interface UnreadResponse {
  totalUnread: number;
  chats: UnreadInfo[];
}

export interface CreateChatData {
  name: string;
  ownerId: string;
  membersIds: string[];
}

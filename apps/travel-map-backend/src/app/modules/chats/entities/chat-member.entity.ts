import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chat, chat => chat.members)
  chat: Chat;

  @ManyToOne(() => User, user => user.chats)
  user: User;

  @Column({ default: 'member' })
  role: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  readAt: Date | null;
}

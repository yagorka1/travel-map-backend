import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => ChatMember, m => m.chat)
  members: ChatMember[];

  @OneToMany(() => Message, m => m.chat)
  messages: Message[];
}

export class UserChatDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;

  constructor(partial: Partial<UserChatDto>) {
    Object.assign(this, partial);
  }
}

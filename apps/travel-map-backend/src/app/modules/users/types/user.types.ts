import { User } from '../entities/user.entity';

export type UserProfile = Omit<User, 'passwordHash'>;

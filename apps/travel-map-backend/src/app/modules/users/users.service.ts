import {
  Injectable,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public findAll() {
    return this.userRepository.find();
  }

  public findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
}

import {
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { BCRYPT_SALT_ROUNDS } from './constants/user.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './types/user.types';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  public async getUserProfile(userId: string): Promise<UserProfile> {
    const user: User | null = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException(
        { errorCode: ErrorsEnum.USER_NOT_FOUND },
        HttpStatus.NOT_FOUND
      );
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new HttpException(
        { errorCode: ErrorsEnum.PASSWORD_MISMATCH },
        HttpStatus.BAD_REQUEST
      );
    }

    const user: User | null = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(
        { errorCode: ErrorsEnum.USER_NOT_FOUND },
        HttpStatus.NOT_FOUND
      );
    }

    const isMatch: boolean = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new HttpException(
        { errorCode: ErrorsEnum.INCORRECT_CURRENT_PASSWORD },
        HttpStatus.BAD_REQUEST
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.save(user);
  }

  public async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    avatarFile?: Express.Multer.File
  ): Promise<UserProfile> {
    const user: User | null = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException(
        { errorCode: ErrorsEnum.USER_NOT_FOUND },
        HttpStatus.NOT_FOUND
      );
    }

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }

    if (updateProfileDto.language !== undefined) {
      user.language = updateProfileDto.language;
    }

    if (avatarFile) {
      if (user.avatarUrl) {
        try {
          await unlinkAsync(user.avatarUrl);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }

      user.avatarUrl = avatarFile.path;
    }

    await this.userRepository.save(user);

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}


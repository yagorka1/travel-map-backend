import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { User } from '../users/entities/user.entity';
import { LanguageEnum } from '../users/enums/language.enum';
import { UsersService } from '../users/users.service';
import {
    ACCESS_TOKEN_EXPIRY,
    BCRYPT_SALT_ROUNDS,
    REFRESH_TOKEN_EXPIRY
} from './constants/auth.constants';
import { JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    public jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        { errorCode: ErrorsEnum.INVALID_LOGIN_OR_PASSWORD },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }

  public async signUpUser(data: { email: string; password: string; name: string; language?: LanguageEnum }): Promise<User> {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException(
        { errorCode: ErrorsEnum.USER_ALREADY_EXISTS },
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      language: data.language || LanguageEnum.EN,
    });

    return this.userRepository.save(user);
  }

  public generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  public generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRY });
  }
}

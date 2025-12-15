import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
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

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  public async validateUser(email: string, password: string): Promise<User> {
    try {
      console.log('validate', email);

      const user = await this.usersService.findByEmail(email);
      console.log('user:', user);

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
    } catch (e) {
      console.error('❌ validateUser error:', e);
      throw e;
    }
  }

  public async signUpUser(data: {
    email: string;
    password: string;
    name: string;
    language?: LanguageEnum;
  }): Promise<User> {
    try {
      console.log('signUpUser:', data.email);

      const existingUser = await this.usersService.findByEmail(data.email);
      console.log('existingUser:', existingUser);

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
        language: data.language ?? LanguageEnum.EN,
      });

      return await this.userRepository.save(user);
    } catch (e) {
      console.error('❌ signUpUser error:', e);
      throw e;
    }
  }

  public generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  public generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRY });
  }

  public async loginWithGoogle(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new HttpException(
          { errorCode: ErrorsEnum.GOOGLE_AUTH_FAILED },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const email = payload.email;
      const name = payload.name ?? 'User';
      const avatarUrl = payload?.picture;

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.userRepository.save(
          this.userRepository.create({
            email,
            name,
            avatarUrl,
            language: LanguageEnum.EN,
            isOAuth: true,
          }),
        );
      } else if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        user = await this.userRepository.save(user);
      }

      const userPayload: JwtPayload = { id: user.id, email: user.email };
      const accessToken = this.generateAccessToken(userPayload);
      const refreshToken = this.generateRefreshToken(userPayload);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Google login error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        { errorCode: ErrorsEnum.GOOGLE_AUTH_FAILED },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

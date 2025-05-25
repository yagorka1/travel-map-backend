import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.create({
        ...registerDto,
        provider: 'local'
      });

      const tokens = await this.generateTokens(user);
      await this.usersService.updateRefreshToken(user._id as string, tokens.refresh_token);


      return {
        user,
        ...tokens,
      };
    } catch (error) {
      const mongoError = error as any;
      if (mongoError.code === 11000) {
        throw new BadRequestException('User with this email already exists');
      }
      throw error;
    }
  }

  async login(user: UserDocument): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user)
    await this.usersService.updateRefreshToken(user._id as string, tokens.refresh_token)

    return {
      user,
      ...tokens,
    }
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email)
    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    return user
  }

  private async generateTokens(user: UserDocument): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = {
      sub: (user._id as string).toString(),
      email: user.email
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m')
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d')
      })
    ]);

    return {
      access_token,
      refresh_token
    };
  }

}

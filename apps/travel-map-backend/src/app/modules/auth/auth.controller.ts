import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/types/user.types';
import { AuthService } from './auth.sevice';
import { JwtPayload } from './types/auth.types';
import { REFRESH_TOKEN_COOKIE_NAME } from './constants/auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const user: User = await this.authService.validateUser(body.email, body.password);

    const payload: JwtPayload = { id: user.id, email: user.email };

    const accessToken: string = this.authService.generateAccessToken(payload);
    const refreshToken: string = this.authService.generateRefreshToken(payload);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { accessToken };
  }

  @Post('sign-up')
  async signUp(
    @Body() body: { email: string; password: string; name: string },
  ): Promise<{ user: UserProfile }> {
    const user: User = await this.authService.signUpUser(body);

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ accessToken: string }> {
    const refreshToken: string | undefined = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new HttpException(
        {
          errorCode: ErrorsEnum.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload: JwtPayload = await this.authService.jwtService.verifyAsync(refreshToken);
      const user: JwtPayload = { id: payload.id, email: payload.email };
      const newAccessToken: string = this.authService.generateAccessToken(user);
      const newRefreshToken: string = this.authService.generateRefreshToken(user);

      res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new HttpException(
        {
          errorCode: ErrorsEnum.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
    return { success: true };
  }
}

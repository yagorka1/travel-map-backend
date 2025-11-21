import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.sevice';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { ErrorsEnum } from '../core/enums/errors.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);

    const payload = { id: user.id, email: user.email };

    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    res.cookie('refresh_token', refreshToken, {
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
  ) {
    const user = await this.authService.signUpUser(body);

    const { passwordHash, ...safeUser } = user;
    return { user: safeUser };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new HttpException(
        {
          errorCode: ErrorsEnum.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload = await this.authService.jwtService.verifyAsync(refreshToken);
      const user = { id: payload.id, email: payload.email };
      const newAccessToken = this.authService.generateAccessToken(user);
      const newRefreshToken = this.authService.generateRefreshToken(user);

      res.cookie('refresh_token', newRefreshToken, {
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
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }
}

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthResponse } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any): Promise<AuthResponse> {
    console.log(req);
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post("logout")
  // @HttpCode(HttpStatus.OK)
  // async logout(@Request() req: any): Promise<{ message: string }> {
  //   await this.authService.logout(req.user._id)
  //   return { message: "Logged out successfully" }
  // }
  //
  // @UseGuards(JwtRefreshGuard)
  // @Post("refresh")
  // @HttpCode(HttpStatus.OK)
  // async refreshTokens(@Request() req: any): Promise<AuthResponse> {
  //   const userId = req.user.sub
  //   const refreshToken = req.user.refreshToken
  //   return this.authService.refreshTokens(userId, refreshToken)
  // }
}

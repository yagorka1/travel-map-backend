import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { avatarUploadConfig } from '../core/config/file-upload.config';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  public getProfile(@Request() req: any): Promise<Omit<User, 'passwordHash'>> {
    const userId = req.user.userId;

    return this.usersService.getUserProfile(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  public async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  @UsePipes(new ValidationPipe({ transform: true }))
  public async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File
  ): Promise<Omit<User, 'passwordHash'>> {
    const userId = req.user.userId;
    return this.usersService.updateProfile(userId, updateProfileDto, avatar);
  }
}

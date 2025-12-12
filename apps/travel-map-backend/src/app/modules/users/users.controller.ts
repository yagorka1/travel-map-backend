import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { avatarUploadConfig } from '../core/config/file-upload.config';
import { AuthenticatedRequest } from '../core/types/request.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfile } from './types/user.types';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  public getProfile(@Request() req: AuthenticatedRequest): Promise<UserProfile> {
    const userId: string = req.user.userId;

    return this.usersService.getUserProfile(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  public async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const userId: string = req.user.userId;
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  @UsePipes(new ValidationPipe({ transform: true }))
  public async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File
  ): Promise<UserProfile> {
    const userId: string = req.user.userId;
    return this.usersService.updateProfile(userId, updateProfileDto, avatar);
  }
}

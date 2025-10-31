import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  // @Post('create')
  // async createUser(
  //   @Body() body: { email: string; password: string; name: string },
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //
  //   console.log(body);
  //
  //   let user;
  //
  //   try {
  //     user = await this.usersService.createUser(body)
  //   } catch (error) {
  //     console.log(error)
  //   }
  //
  //
  //
  //   return { user };
  // }
}

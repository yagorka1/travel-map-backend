import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ErrorsEnum } from '../core/enums/errors.enum';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    public jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  public async validateUser(email: string, password: string) {
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

  public async signUpUser(data: { email: string; password: string; name: string }) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException(
        { errorCode: ErrorsEnum.USER_ALREADY_EXISTS },
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  public generateAccessToken(payload: any) {
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  public generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  public test(): Observable<any> {
    return of({ message: 'test request' });
  }
}

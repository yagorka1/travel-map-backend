import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private users = [
    { id: 1, email: 'test@mail.com', passwordHash: bcrypt.hashSync('123456', 10) },
  ];

  constructor(public jwtService: JwtService) {}

  public async validateUser(email: string, password: string) {
    const user = this.users.find(u => u.email === email);

    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) throw new UnauthorizedException();

    return { id: user.id, email: user.email };
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

import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    return { message: 'login endpoint ready' };
  }

  refresh(refreshTokenDto: RefreshTokenDto) {
    return { message: 'refresh endpoint ready' };
  }

  logout() {
    return { message: 'logout endpoint ready' };
  }
}

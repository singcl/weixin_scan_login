import { Strategy } from 'passport-auth-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy, 'checkToken') {
  constructor(private readonly authService: AuthService) {
    super({
      tokenFields: ['token', 'ticket'],
      params: true,
    });
  }

  async validate(token: string): Promise<any> {
    return await this.authService.validateToken(token);
  }
}
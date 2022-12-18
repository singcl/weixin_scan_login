import { Strategy } from 'passport-auth-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'checkScan') {
  constructor(private readonly authService: AuthService) {
    super({
      tokenFields: ['sessionKey'],
      params: true,
    });
  }

  async validate(sessionKey: string): Promise<any> {
    return await this.authService.validateScanSuccess(sessionKey);
  }
}

import { Strategy } from 'passport-auth-token';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';

import { AuthService } from './auth.service';
import { config } from '../config';
@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy, 'checkToken') {
  constructor(
    private readonly authService: AuthService,
    @Inject(config.KEY) protected readonly appConfig: ConfigType<typeof config>,
  ) {
    super({
      headerFields: [appConfig.project.headerLoginToken.toLowerCase()],
      tokenFields: [appConfig.project.headerLoginTicket],
    });
  }

  async validate(token: string): Promise<any> {
    return await this.authService.validateToken(token);
  }
}

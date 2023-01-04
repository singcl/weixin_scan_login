import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { AuthService } from './auth.service';

import { config } from '../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Strategy = require('./../libs/passport-auth-signature/strategy');
@Injectable()
export class SignatureStrategy extends PassportStrategy(
  Strategy,
  'checkSignature',
) {
  constructor(
    private readonly authService: AuthService,
    @Inject(config.KEY) protected readonly appConfig: ConfigType<typeof config>,
  ) {
    super({
      headerSignFields: [appConfig.project.headerSignToken], // 自动格式化为小写
      // tokenSignFields: [appConfig.project.headerSignToken],
      headerSignDateFields: [appConfig.project.headerSignTokenDate], // 自动格式化为小写
      // tokenSignDateFields: [appConfig.project.headerSignTokenDate],
    });
  }

  async validate(signature: string, signatureDate: string): Promise<any> {
    return await this.authService.validateSignature(signature, signatureDate);
  }
}

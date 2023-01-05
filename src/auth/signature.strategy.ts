import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import type { Request as ExpressRequest } from 'express';
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
      passReqToCallback: true,
    });
  }

  async validate(
    req: ExpressRequest,
    signature: string,
    signatureDate: string,
  ): Promise<any> {
    const method = req.method;
    const path = req.path;
    const body = req.body;
    const query = req.query;
    let params: Record<string, any> = {};
    switch (req.method.toLowerCase()) {
      case 'get':
      case 'head':
        params = query;
        break;
      default:
        params = {
          ...query,
          ...body, // TODO: body可能不是对象类型
        };
        break;
    }
    return await this.authService.validateSignature({
      signature,
      signatureDate,
      method,
      path,
      params,
    });
  }
}

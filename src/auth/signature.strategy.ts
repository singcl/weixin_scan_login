import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Strategy = require('./../libs/passport-auth-signature');
@Injectable()
export class SignatureStrategy extends PassportStrategy(
  Strategy,
  'checkSignature',
) {
  constructor(private readonly authService: AuthService) {
    super({
      headerSignFields: ['authorization'], // 自动格式化为小写
      // tokenSignFields: ['authorization'],
      headerSignDateFields: ['authorization-date'], // 自动格式化为小写
      // tokenSignDateFields: ['authorization-date'],
    });
  }

  async validate(signature: string, signatureDate: string): Promise<any> {
    return await this.authService.validateSignature(signature, signatureDate);
  }
}

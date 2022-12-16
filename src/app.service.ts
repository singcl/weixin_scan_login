import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './utils/services/utils.service';
import * as crypto from 'crypto';
// 不能写成这样：
// import crypto from 'crypto';
import { WxCheckSignatureDto } from './dto/wx-check-signature.dto';

import { config } from './config';
@Injectable()
export class AppService {
  constructor(
    // private readonly allConfig: ConfigService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly utilsService: UtilsService,
  ) {}
  getHello(): string {
    console.log('-----utils:', this.utilsService.myCustomUtil());
    return 'Hello World!';
  }

  // 验证消息的确来自微信服务器
  wxCheckSignature(query: WxCheckSignatureDto): string {
    const TOKEN = this.appConfig.params.weixinMpCheckToken;
    const { signature, timestamp, nonce, echostr } = query;
    const str = [TOKEN, timestamp, nonce].sort().join('');
    const signatureCurr = crypto.createHash('sha1').update(str).digest('hex');
    if (signatureCurr === signature) return echostr;
    return null;
  }
}

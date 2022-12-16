import { Controller, Get, Query, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { WxCheckSignatureDto } from './dto/wx-check-signature.dto';
import * as crypto from 'crypto';
import { ConfigType /* ConfigService */ } from '@nestjs/config';

import { config } from './config';
// 不能写成这样：
// import crypto from 'crypto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly allConfig: ConfigService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  // 验证消息的确来自微信服务器
  @Get('handleWxCheckSignature')
  handleWxCheckSignature(@Query() query: WxCheckSignatureDto): string {
    const TOKEN = this.appConfig.params.weixinMpCheckToken;
    const { signature, timestamp, nonce, echostr } = query;
    const str = [TOKEN, timestamp, nonce].sort().join('');
    const signatureCurr = crypto.createHash('sha1').update(str).digest('hex');
    if (signatureCurr === signature) return echostr;
    return null;
  }
}

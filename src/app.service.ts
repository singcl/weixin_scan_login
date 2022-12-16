import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './utils/services/utils.service';
import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
} from './dto/wx-check-signature.dto';

import { config } from './config';
@Injectable()
export class AppService {
  constructor(
    // private readonly allConfig: ConfigService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly utilsService: UtilsService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  // 验证消息的确来自微信服务器
  wxCheckSignature(query: WxCheckSignatureDto): string {
    const TOKEN = this.appConfig.params.weixinMpCheckToken;
    return this.utilsService.checkWxSha1Equal(query, TOKEN);
  }

  // 暂时只处理订阅/取消订阅事件
  wxEvent(data: WxSubscribeEventDto) {
    //
    console.log('----data', data);
    return 'success';
  }

  getWxAccessToken() {
    //
  }
}

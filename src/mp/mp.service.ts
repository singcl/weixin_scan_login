import { Injectable, Inject /* CACHE_MANAGER */ } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from '../utils/services/utils.service';
// import { Cache } from 'cache-manager';
// import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { MiniSdkService } from '../mini-sdk/mini-sdk.service';

import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
  // WxLoginQrcodeDto,
} from './dtos/wx-check-signature.dto';

import { config } from '../config';

@Injectable()
export class MpService {
  constructor(
    // private readonly allConfig: ConfigService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // private readonly httpService: HttpService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly miniSdkService: MiniSdkService,
  ) {}

  login() {
    return { message: 'Hello world!' };
  }

  // 验证消息的确来自微信服务器
  wxCheckSignature(query: WxCheckSignatureDto): string {
    const TOKEN = this.appConfig.params.weixinMpCheckToken;
    return this.utilsService.checkWxSha1Equal(query, TOKEN);
  }

  // 暂时只处理订阅/取消订阅事件
  async wxEvent(data: WxSubscribeEventDto) {
    console.log('微信公众号事件推送：', data);
    const { Ticket, Event, FromUserName, MsgType } = data;
    const event = Event && Event[0].trim();
    const msgType = MsgType && MsgType[0].trim();
    const openid = FromUserName[0].trim();
    console.log(`用户${openid}: ${event || msgType}`);
    if (['subscribe', 'SCAN'].includes(event)) {
      const ticket = Ticket && Ticket[0].trim();
      await this.usersService.createWxUser(openid, ticket);
    }
    return 'success';
  }

  // 获取公众号临时二维码
  async mpQrcode() {
    const { ticket, expire_seconds /* , url */ } =
      await this.miniSdkService.getMpQrCode();
    const salt = this.appConfig.params.weixinLoginSalt;
    const sessionKey = this.utilsService.getSha1(ticket + salt);
    const qrcodeUrl = this.utilsService.sprintf(
      this.appConfig.params.weixinMpQrCodeUrl,
      [ticket],
    );
    return {
      sessionKey,
      expires: expire_seconds,
      heartBeat: 5,
      url: qrcodeUrl,
    };
  }

  // 获取小程序 小程序码
  async mpMiniQrcode() {
    //
  }
}

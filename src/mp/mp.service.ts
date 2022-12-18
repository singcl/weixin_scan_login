import { Injectable, Inject /* CACHE_MANAGER */ } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from '../utils/services/utils.service';
// import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';

import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
  WxTokenApiDto,
  WxQrcodeApiDto,
  // WxLoginQrcodeDto,
} from './dtos/wx-check-signature.dto';

import { config } from '../config';

@Injectable()
export class MpService {
  constructor(
    // private readonly allConfig: ConfigService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly utilsService: UtilsService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
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

  //获取临时token
  async getWxAccessToken() {
    const { weixinApiTokenUrl, weixinAppSecret, weixinAppId } =
      this.appConfig.params;
    const url = this.utilsService.sprintf(weixinApiTokenUrl, [
      weixinAppId,
      weixinAppSecret,
    ]);

    const {
      data: { /*  expires_in, */ access_token },
    } = await firstValueFrom(this.httpService.get<WxTokenApiDto>(url));
    return access_token;
  }

  //获取临时二维码
  async getQrCode() {
    const token = await this.getWxAccessToken();
    const url = this.utilsService.sprintf(
      this.appConfig.params.weixinApiQrCodeUrl,
      [token],
    );
    const { data } = await firstValueFrom(
      this.httpService.post<WxQrcodeApiDto>(url, {
        expire_seconds: 604800,
        action_name: 'QR_STR_SCENE',
        action_info: { scene: { scene_str: 'test' } },
      }),
    );
    return data;
  }

  async mpQrcode() {
    const { ticket, expire_seconds /* , url */ } = await this.getQrCode();
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
}

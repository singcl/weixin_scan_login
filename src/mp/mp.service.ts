import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  GoneException,
} from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import type { Response as ExpressResponse } from 'express';
import { UtilsService } from '../utils/services/utils.service';
import { Cache } from 'cache-manager';
// import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { MiniSdkService } from '../mini-sdk/mini-sdk.service';
import { CodeService } from '../code/code.service';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // private readonly httpService: HttpService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
    private readonly miniSdkService: MiniSdkService,
    private readonly codeService: CodeService,
  ) {}

  login() {
    return { nodeEnv: this.appConfig.server.nodeEnv };
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
      await this.usersService.createWxUser(openid);
      await this.usersService.saveTempWxUser(openid, ticket);
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
    return this.codeService.business('Success', {
      sessionKey,
      expires: expire_seconds,
      heartBeat: 5,
      url: qrcodeUrl,
    });
  }

  // 获取小程序 小程序码
  async mpMiniQrcode(res: ExpressResponse, ticket: string, env?: string) {
    const salt = this.appConfig.params.weixinLoginMiniSceneSalt;
    const scene = this.utilsService.getMd5(ticket + salt);
    const data = await this.miniSdkService.getMpMiniQrCode(scene, env);
    res.type('png').send(data);
  }

  // 获取小程序登录临时token
  mpMiniToken() {
    const sessionKey = this.utilsService.genUuidToken();
    return this.codeService.business('Success', sessionKey);
  }

  // 小程序登录
  async mpMiniProgramLogin(code: string) {
    const response = await this.miniSdkService.miniCode2Session(code);
    if (this.utilsService.isWxError(response)) {
      throw new GoneException(this.codeService.business('AuthLoginWxApiError'));
    }
    const { session_key, openid } = response;
    const res = await this.usersService.createWxUser(openid);
    return this.usersService.genUserSession(openid, res);
  }

  // 微信小程序确认Confirm
  async mpMiniProgramScanConform(sc: string, user: Record<string, any>) {
    await this.cacheManager.set(sc, user.openid, 10 * 1000);
    return this.codeService.business('Success');
  }
}

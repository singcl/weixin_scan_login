import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from '../utils/services/utils.service';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    return {
      sessionKey,
      expires: expire_seconds,
      heartBeat: 5,
      url: qrcodeUrl,
    };
  }

  // 获取小程序 小程序码
  async mpMiniQrcode(ticket: string) {
    const salt = this.appConfig.params.weixinLoginMiniSceneSalt;
    const scene = this.utilsService.getMd5(ticket + salt);
    const data = await this.miniSdkService.getMpMiniQrCode(scene);
    return data;
  }

  // 获取小程序登录临时token
  mpMiniToken() {
    const sessionKey = this.utilsService.genUuidToken();
    return {
      sessionKey,
      success: true,
    };
  }

  // 小程序登录
  // TODO: 1. 重复登录 2. 已经登录不再发起请求的情况 3. 这里的逻辑移动到其他合理的模块
  async mpMiniProgramLogin(code: string) {
    const { session_key, openid } = await this.miniSdkService.miniCode2Session(
      code,
    );
    const res = await this.usersService.createWxUser(openid);
    //
    const openidKey = `wechat:login_openid:${openid}`;
    const salt = this.appConfig.params.weixinLoginSalt;
    const token = this.utilsService.genRandomToken(openid, salt);
    const ttl = 30 * 60 * 1000;
    const tokenKey = `wechat:login_user:${token}`;
    const userInfo: Record<string, any> | null = await this.cacheManager.get(
      openidKey,
    );
    if (userInfo) {
      const loginTokenList: string[] = userInfo.loginTokenList || [];
      const loginTokenList2: string[] = [];
      for (let i = 0; i < loginTokenList.length; i++) {
        const tkKey = loginTokenList[i];
        const oId = await this.cacheManager.get(tkKey);
        if (oId) {
          loginTokenList2.push(tkKey);
        }
      }
      if (loginTokenList2.length >= 5) {
        return {
          code: -1,
          msg: '同一个账号最多在3台设备上登录',
          success: false,
        };
      }
      userInfo.loginTokenList = loginTokenList2;
      await this.cacheManager.set(
        openidKey,
        {
          ...userInfo,
          loginTokenList: [...loginTokenList2, tokenKey],
        },
        ttl,
      );
    } else {
      await this.cacheManager.set(
        openidKey,
        {
          ...res,
          loginTokenList: [tokenKey],
        },
        ttl,
      );
    }
    //
    await this.cacheManager.set(tokenKey, openidKey, ttl);
    return {
      code: 0,
      msg: '登录成功',
      success: true,
      data: {
        token: token,
      },
    };
  }

  // 微信小程序确认Confirm
  async mpMiniProgramScanConform(sc: string, user: Record<string, any>) {
    await this.cacheManager.set(sc, user.openid, 10 * 1000);
    return {
      code: 0,
      msg: '确认登录成功',
      success: true,
    };
  }
  // 微信小程序确认Check
  // TODO: 1. 重复登录 2. 已经登录不再发起请求的情况 3. 这里的逻辑移动到其他合理的模块
  async mpMiniProgramScanCheck(sessionKey: string) {
    const salt = this.appConfig.params.weixinLoginMiniSceneSalt;
    const scene = this.utilsService.getMd5(sessionKey + salt);

    if (!sessionKey) {
      return {
        code: -1,
        msg: '缺少参数',
        success: false,
      };
    }
    const openid: string = await this.cacheManager.get(scene);
    if (!openid) {
      return {
        code: 0,
        msg: '登录中...',
        success: true,
      };
    }

    const res = await this.usersService.findOneByOpenId(openid);
    if (!res) {
      return {
        code: -3,
        msg: '登录失败',
        success: false,
      };
    }
    const openidKey = `wechat:login_openid:${openid}`;

    const token = this.utilsService.genRandomToken(openid, salt);
    const ttl = 30 * 60 * 1000;
    const tokenKey = `wechat:login_user:${token}`;
    const userInfo: Record<string, any> | null = await this.cacheManager.get(
      openidKey,
    );
    if (userInfo) {
      const loginTokenList: string[] = userInfo.loginTokenList || [];
      const loginTokenList2: string[] = [];
      for (let i = 0; i < loginTokenList.length; i++) {
        const tkKey = loginTokenList[i];
        const oId = await this.cacheManager.get(tkKey);
        if (oId) {
          loginTokenList2.push(tkKey);
        }
      }
      if (loginTokenList2.length >= 5) {
        return {
          success: false,
          token: null,
          message: '同一个账号最多在3台设备上登录',
        };
      }
      userInfo.loginTokenList = loginTokenList2;
      await this.cacheManager.set(
        openidKey,
        {
          ...userInfo,
          loginTokenList: [...loginTokenList2, tokenKey],
        },
        ttl,
      );
    } else {
      await this.cacheManager.set(
        openidKey,
        {
          ...res,
          loginTokenList: [tokenKey],
        },
        ttl,
      );
    }
    //
    await this.cacheManager.set(tokenKey, openidKey, ttl);
    await this.cacheManager.del(scene);
    return {
      code: 0,
      msg: '确认登录成功',
      success: true,
      data: {
        token,
      },
    };
  }
}

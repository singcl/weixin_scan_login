import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './utils/services/utils.service';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
  WxTokenApiDto,
  WxQrcodeApiDto,
  // WxLoginQrcodeDto,
} from './dto/wx-check-signature.dto';

import { config } from './config';

@Injectable()
export class AppService {
  constructor(
    // private readonly allConfig: ConfigService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly utilsService: UtilsService,
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  home() {
    return { message: 'Hello world!' };
  }

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
    const { Ticket, Event, FromUserName } = data;
    const event = Event[0].trim();
    const openid = FromUserName[0].trim();
    console.log(`用户${openid}: ${event}`);
    if (['subscribe', 'SCAN'].includes(event)) {
      const ticket = Ticket && Ticket[0].trim();
      if (['subscribe'].includes(event)) {
        // 获取openid判断用户是否存在,不存在则获取新增用户,自己的业务
        const res = await this.usersRepository.findOneBy({ openid });
        if (!res) {
          const user = new User();
          user.mobile = '130xxxxxxxx';
          user.openid = openid;
          user.nickname = `微信用户${this.utilsService.getRandomStr()}`;
          this.usersRepository.save(user);
        }
      }
      const salt = this.appConfig.params.weixinLoginSalt;
      const sessionKey = this.utilsService.getSha1(ticket + salt);
      await this.cacheManager.set(sessionKey, openid, 10 * 1000);
    }
    return 'success';
  }

  //获取临时token
  async getWxAccessToken() {
    //
    const key = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    const val = await this.cacheManager.get<string>(key);
    if (val) return val;
    const { weixinApiTokenUrl, weixinAppSecret, weixinAppId } =
      this.appConfig.params;
    const url = this.utilsService.sprintf(weixinApiTokenUrl, [
      weixinAppId,
      weixinAppSecret,
    ]);

    const {
      data: { expires_in, access_token },
    } = await firstValueFrom(this.httpService.get<WxTokenApiDto>(url));
    await this.cacheManager.set(key, access_token, expires_in);
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

  async mpQrcodeCheck(sessionKey?: string) {
    if (!sessionKey) {
      return {
        success: false,
        token: null,
      };
    }

    const openid: string = await this.cacheManager.get(sessionKey);
    if (!openid) {
      return {
        success: false,
        token: null,
      };
    }

    const salt = this.appConfig.params.weixinLoginSalt;
    const token = this.utilsService.getSha1(openid + salt);
    const res = await this.usersRepository.findOneBy({ openid });
    if (!res) {
      return {
        success: false,
        token: null,
      };
    }
    await this.cacheManager.set(`login_${token}`, res, 30 * 60 * 1000);
    await this.cacheManager.del(sessionKey);
    return {
      success: true,
      token: token,
    };
  }
}

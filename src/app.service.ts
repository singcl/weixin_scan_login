import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './utils/services/utils.service';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
  WxCheckSignatureDto,
  WxSubscribeEventDto,
  WxTokenApiDto,
  WxQrcodeApiDto,
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
  ) {}

  home() {
    return { message: 'Hello world!' };
  }

  // 验证消息的确来自微信服务器
  wxCheckSignature(query: WxCheckSignatureDto): string {
    const TOKEN = this.appConfig.params.weixinMpCheckToken;
    return this.utilsService.checkWxSha1Equal(query, TOKEN);
  }

  // 暂时只处理订阅/取消订阅事件
  wxEvent(data: WxSubscribeEventDto) {
    // TODO:
    console.log('----data', data);
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
}

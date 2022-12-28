import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { config } from './../config';
import { UtilsService } from '../utils/services/utils.service';
import {
  WxTokenApiDto,
  WxCode2SessionApiDto,
  WxQrcodeApiDto,
  WxErrorInfo,
} from './dtos/mini-sdk.dto';
import { WxMiniQrcodeApiDto } from './interfaces/mini-skd.interface';

@Injectable()
export class MiniSdkService {
  constructor(
    private readonly utilsService: UtilsService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly httpService: HttpService,
  ) {}
  // 小程序获取临时token
  async getMiniAccessToken() {
    const { weixinApiTokenUrl, miniAppId, miniAppSecret } =
      this.appConfig.params;
    const url = this.utilsService.sprintf(weixinApiTokenUrl, [
      miniAppId,
      miniAppSecret,
    ]);

    const { data } = await firstValueFrom(
      this.httpService.get<WxTokenApiDto>(url),
    );
    return data;
  }

  // 登录凭证校验。通过 wx.login 接口获得临时登录凭证 code 后传到开发者服务器调用此接口完成登录流程。更多使用方法详见小程序登录。
  async miniCode2Session(code: string) {
    const { weixinMpCode2SessionUrl, miniAppId, miniAppSecret } =
      this.appConfig.params;
    const url = this.utilsService.sprintf(weixinMpCode2SessionUrl, [
      miniAppId,
      miniAppSecret,
      code,
    ]);
    const { data } = await firstValueFrom(
      this.httpService.get<WxCode2SessionApiDto | WxErrorInfo>(url),
    );
    return data;
  }

  // 公众号获取临时token
  async getWxAccessToken() {
    const { weixinApiTokenUrl, weixinAppSecret, weixinAppId } =
      this.appConfig.params;
    const url = this.utilsService.sprintf(weixinApiTokenUrl, [
      weixinAppId,
      weixinAppSecret,
    ]);

    const { data } = await firstValueFrom(
      this.httpService.get<WxTokenApiDto>(url),
    );
    return data;
  }

  // 获取公众号临时二维码
  async getMpQrCode() {
    const { access_token } = await this.getWxAccessToken();
    const url = this.utilsService.sprintf(
      this.appConfig.params.weixinApiQrCodeUrl,
      [access_token],
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

  // 获取小程序临时小程序码
  // @see https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/getUnlimitedQRCode.html#%E8%B0%83%E7%94%A8%E6%96%B9%E5%BC%8F
  async getMpMiniQrCode(scene: string, env?: string) {
    const { access_token } = await this.getMiniAccessToken();
    const url = this.utilsService.sprintf(
      this.appConfig.params.weixinMpMiniQrcodeUrl,
      [access_token],
    );
    const { data } = await firstValueFrom(
      this.httpService.post<WxMiniQrcodeApiDto>(
        url,
        {
          scene,
          // 'release' | 'trial' | 'develop'
          env_version: ['release', 'trial', 'develop'].includes(env)
            ? env
            : 'trial',
          check_path: false,
          page: 'pages/index/index',
        },
        {
          responseType: 'arraybuffer',
        },
      ),
    );
    return data;
  }
}

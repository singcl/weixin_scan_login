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
} from './dtos/mini-sdk.dto';

@Injectable()
export class MiniSdkService {
  constructor(
    private readonly utilsService: UtilsService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    private readonly httpService: HttpService,
  ) {}
  //获取临时token
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
      this.httpService.get<WxCode2SessionApiDto>(url),
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
}

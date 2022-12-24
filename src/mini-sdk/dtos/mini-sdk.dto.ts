export class WxTokenApiDto {
  readonly access_token: string;
  readonly expires_in: number;
}

// https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
export class WxCode2SessionApiDto {
  readonly session_key: string;
  readonly unionid: string;
  readonly openid: string;
  readonly errmsg: string;
  readonly errcode: number;
}

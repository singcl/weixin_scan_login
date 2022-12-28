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

// https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
export class WxQrcodeApiDto {
  readonly ticket: string;
  readonly url: string;
  readonly expire_seconds: number;
}

export class WxErrorInfo {
  readonly errcode: string;
  readonly errmsg: string;
}

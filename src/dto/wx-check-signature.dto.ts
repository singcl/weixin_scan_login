/*
  wx-check-signature.dto.ts
*/
export class WxCheckSignatureDto {
  readonly signature: string;
  readonly echostr: string;
  readonly timestamp: string;
  readonly nonce: string;
}

export class WxSubscribeEventDto {
  readonly ToUserName: string[];
  readonly FromUserName: string[];
  readonly CreateTime: string[];
  readonly MsgType: string[];
  readonly Event: string[];
  readonly EventKey: string[];
}

export class WxTokenApiDto {
  readonly access_token: string;
  readonly expires_in: number;
}

// https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
export class WxQrcodeApiDto {
  readonly ticket: string;
  readonly url: string;
  readonly expire_seconds: number;
}

export class WxLoginQrcodeDto {
  expires: number;
  heartBeat: number;
  sessionKey: string;
  url: string;
}

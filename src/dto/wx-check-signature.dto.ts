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

/*
  wx-check-signature.dto.ts
*/
export class WxCheckSignatureDto {
  readonly signature: string;
  readonly echostr: string;
  readonly timestamp: string;
  readonly nonce: string;
}

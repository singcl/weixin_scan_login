// https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/qrcode-link/qr-code/getUnlimitedQRCode.html#%E8%B0%83%E7%94%A8%E6%96%B9%E5%BC%8F
export type WxMiniQrcodeApiDto =
  | ArrayBuffer
  | {
      readonly errmsg: string;
      readonly errcode: number;
    };

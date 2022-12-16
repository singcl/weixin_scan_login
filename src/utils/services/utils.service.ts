import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
// 不能写成这样：
// import crypto from 'crypto';
import { WxCheckSignatureDto } from '../../dto/wx-check-signature.dto';
@Injectable()
export class UtilsService {
  // sha1加密
  getSha1(str: string) {
    return crypto.createHash('sha1').update(str).digest('hex');
  }
  checkWxSha1Equal(query: WxCheckSignatureDto, token: string) {
    const { signature, timestamp, nonce, echostr } = query;
    const str = [token, timestamp, nonce].sort().join('');
    const signatureCurr = this.getSha1(str);
    if (signatureCurr === signature) return echostr;
    return null;
  }
  sprintf(template: string, values: string[]): string {
    return template.replace(/%s/g, function () {
      return values.shift();
    });
  }
}

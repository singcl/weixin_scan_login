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

  // 随机生成[min, max]
  randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // 随机生成10位组合字符串
  getRandomStr(m = 10) {
    let str = '';
    for (let i = 0; i < m; i++) {
      const index = this.randomInt(1, 3);
      switch (index) {
        case 1:
          str += String.fromCharCode(this.randomInt(97, 122));
          break;
        case 2:
          str += String.fromCharCode(this.randomInt(65, 90));
          break;
        case 3:
          str += String(this.randomInt(0, 9));
          break;
        default:
          break;
      }
    }
    return str;
  }
}

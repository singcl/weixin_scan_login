import { ZhCNText } from './zh-cn';
import { Injectable } from '@nestjs/common';
import { Code } from './constants';

export interface Failure {
  code: number; //   `json:"code"`    // 业务码
  msg: string; // `json:"message"` // 描述信息
}

// Success 成功时返回结构
export interface Success {
  code: number; //         `json:"code"`    // 业务码
  msg: string; //      `json:"message"` // 描述信息
  data: any; //  `json:"data"`    //业务返回数据
}

@Injectable()
export class CodeService {
  code(key: keyof typeof Code) {
    return Code[key];
  }
  // TODO: 依赖语言配置
  text(key: keyof typeof Code) {
    return ZhCNText[key];
  }
  business(key: keyof typeof Code, data?: unknown): Failure | Success {
    return {
      code: this.code(key),
      msg: this.text(key),
      data,
    };
  }
}

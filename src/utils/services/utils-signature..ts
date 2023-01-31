import * as qs from 'querystring';
import * as crypto from 'crypto';
import { CSTLayoutString } from './utils-date';
type Signature = {
  key: string;
  secret: string;
  ttl: number;
};
type Result<T = any> = { success: boolean; msg?: string; data?: T };
export class UtilsSignature {
  delimiter = '|';
  // 合法的 Methods
  methods: Record<string, boolean> = {
    GET: true,
    POST: true,
    HEAD: true,
    PUT: true,
    PATCH: true,
    DELETE: true,
    CONNECT: true,
    OPTIONS: true,
    TRACE: true,
  };
  constructor(private readonly signature: Signature) {}

  sortByKey(unordered: Record<string, any>) {
    return Object.keys(unordered)
      .sort()
      .reduce((obj, key) => {
        obj[key] = unordered[key];
        return obj;
      }, {});
  }

  // Generate
  // path 请求的路径 (不附带 querystring)
  generate(path: string, method: string, params: Record<string, any>): Result {
    if (path == '') {
      return {
        success: false,
        msg: 'path required',
      };
    }
    if (method == '') {
      return {
        success: false,
        msg: 'method required',
      };
    }
    const methodName = method.toUpperCase();
    if (!this.methods[methodName]) {
      return {
        success: false,
        msg: 'method param error',
      };
    }
    //
    const date = CSTLayoutString(Date.now());
    const sortParamsEncode = qs.stringify(this.sortByKey(params));
    const enStr = `${path}${this.delimiter}${methodName}${this.delimiter}${sortParamsEncode}${this.delimiter}${date}`;
    //
    const digest = crypto
      .createHmac('sha256', this.signature.secret)
      .update(enStr)
      .digest('base64');
    const authorization = `${this.signature.key} ${digest}`;
    return {
      success: true,
      data: authorization,
    };
  }
  verify(
    authorization: string,
    date: string,
    path: string,
    method: string,
    params: Record<string, any>,
  ) {
    if (date == '') {
      return {
        success: false,
        msg: 'date required',
      };
    }
    if (path == '') {
      return {
        success: false,
        msg: 'path required',
      };
    }
    if (method == '') {
      return {
        success: false,
        msg: 'method required',
      };
    }
    const methodName = method.toUpperCase();
    if (!this.methods[methodName]) {
      return {
        success: false,
        msg: 'method param error',
      };
    }
  }
}

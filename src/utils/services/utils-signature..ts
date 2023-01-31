import * as qs from 'querystring';
import * as crypto from 'crypto';
import {
  CSTLayoutString,
  parseCSTInLocation,
  subInLocation,
} from './utils-date';
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

  //
  digest(
    date: string,
    path: string,
    methodName: string,
    params: Record<string, any>,
  ) {
    const sortParamsEncode = qs.stringify(this.sortByKey(params));
    const enStr = `${path}${this.delimiter}${methodName}${this.delimiter}${sortParamsEncode}${this.delimiter}${date}`;
    //
    const digest = crypto
      .createHmac('sha256', this.signature.secret)
      .update(enStr)
      .digest('base64');

    return `${this.signature.key} ${digest}`;
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
    const authorization = this.digest(date, path, methodName, params);
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
    const ts = parseCSTInLocation(date);
    if (ts.toString() === 'Invalid Date') {
      return {
        success: false,
        msg: "date must follow '2006-01-02 15:04:05'",
      };
    }

    if (subInLocation(ts) > this.signature.ttl) {
      return {
        success: false,
        msg: `date exceeds limit ${this.signature.ttl}`,
      };
    }

    const auth = this.digest(date, path, methodName, params);
    const ok = authorization == auth;

    if (!ok)
      return {
        success: false,
        mgs: '验证失败',
      };

    return {
      success: true,
      data: true,
    };
  }
}

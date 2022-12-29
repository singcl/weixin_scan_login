/* global Promise */
import Md5Con from '../../lib/authorization/md5.min.js';
import generateAuthorization from './../generateAuthorization.js';

//
export default class Kiko {
  businessKey = 'admin';
  businessSecret = '12878dd962115106db6d';

  /**
   * @param {{businessKey: string, businessSecret: string}} params
   */
  constructor(params) {
    const businessKey = params && params.businessKey;
    const businessSecret = params && params.businessSecret;
    if (typeof businessKey !== 'undefined') this.businessKey = businessKey;
    if (typeof businessSecret !== 'undefined') this.businessSecret = businessSecret;
  }
  /**
   *
   * @param {RequestInfo} input
   * @param {RequestInit} init
   * @returns
   */
  async fetch(input, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : input && input.url;
    const body = init.body;
    //
    let password = body && body.password;
    password = password ? Md5Con.md5(password) : password;

    let bodyR = body && Object.assign({}, body, password && { password });
    //
    const authorizationData = generateAuthorization({
      path: url.split('?')[0],
      method,
      params: bodyR,
      businessKey: this.businessKey,
      businessSecret: this.businessSecret,
    });
    //
    const token = localStorage.getItem(Kiko.getTokenName());
    // GET HEAD 请求不能穿BODY
    const banBody = ['GET', 'HEAD'].some((m) => m === method);
    const bodyRQS = new URLSearchParams(bodyR).toString();
    /**
     * @type {RequestInit}
     */
    const initAuth = Object.assign({}, init, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        Authorization: authorizationData.authorization,
        'Authorization-Date': authorizationData.date,
        Token: token,
      },
      body: !banBody && bodyRQS ? bodyRQS : null,
    });
    //
    let inputR = input;
    if (banBody) {
      switch (typeof inputR) {
        case 'string':
          inputR = `${inputR}${bodyRQS ? '?' + bodyRQS : bodyRQS}`;
          break;
        case 'object':
          inputR.url = `${inputR.url}${bodyRQS ? '?' + bodyRQS : bodyRQS}`;
          break;
        default:
          break;
      }
    }

    //
    const response = await fetch(inputR, initAuth);
    const status = response.status;
    const ok = response.ok;
    if (ok && status == 200) {
      const resBody = await response.json();
      return resBody;
    } else {
      const err = new Error(response.statusText);
      err.code = status;
      return Promise.reject(err);
    }
  }

  static getTokenName() {
    return '_login_token_';
  }
}

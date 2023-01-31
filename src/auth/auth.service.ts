import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  UnauthorizedException,
  GoneException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import type { Request as ExpressRequest } from 'express';
import { UtilsService } from './../utils/services/utils.service';
import { UsersService } from './../users/users.service';
import { CodeService } from './../code/code.service';
import { AuthorizedCommonService } from './../authorized/authorized_common.service';
import { UtilsUrltable } from './../utils/services/utils-urltable';

import { config, constants } from './../config';

// interface ValidateSignature {
//   signature: string;
//   signatureDate: string;
//   method: string;
//   path: string;
//   params: any;
// }

@Injectable()
export class AuthService {
  constructor(
    private readonly codeService: CodeService,
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
    private readonly authorizedCommonService: AuthorizedCommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    @Inject(constants.KEY)
    private readonly constantsConfig: ConfigType<typeof constants>,
    @Inject('URL_TABLE')
    private readonly newUtilsUrltable: () => UtilsUrltable,
  ) {
    //
  }
  // TODO:z怎么优雅更新redis key 的过期时间？
  async updateRedisKeyTTL(key: string, ttl: number) {
    const value = await this.cacheManager.get(key);
    if (value) {
      await this.cacheManager.set(key, value, ttl);
    }
  }
  //
  async validateScanSuccess(
    sessionKey?: string,
    cToken?: string,
  ): Promise<any> {
    //
    if (!sessionKey) {
      throw new GoneException(
        this.codeService.business('AuthLoginParamRequiredError'),
      );
    }
    const salt = this.appConfig.params.weixinLoginMiniSceneSalt;
    const scene = this.utilsService.getMd5(sessionKey + salt);
    const openid: string = await this.cacheManager.get(scene);
    if (!openid) {
      return this.codeService.business('Success');
    }

    const res = await this.usersService.findOneByOpenId(openid);
    if (!res) {
      throw new GoneException(
        this.codeService.business('AuthLoginUserNotFoundError'),
      );
    }

    // 如果有token, 更新当前用户token后直接返回
    if (cToken) {
      const openidKey: string | null = await this.cacheManager.get(
        `${this.appConfig.project.redisKeyPrefixLoginUserToken}${cToken}`,
      );
      if (
        openidKey &&
        openidKey ===
          `${this.appConfig.project.redisKeyPrefixLoginUserOpenid}${openid}`
      ) {
        const ttl = 30 * 60 * 1000;
        await this.updateRedisKeyTTL(
          `${this.appConfig.project.redisKeyPrefixLoginUserToken}${cToken}`,
          ttl,
        );
        await this.updateRedisKeyTTL(openidKey, ttl);
        await this.cacheManager.del(scene);
        return this.codeService.business('Success', cToken);
      }
    }

    const response = await this.usersService.genUserSession(openid, res);
    await this.cacheManager.del(scene);
    return response;
  }

  // header token验证
  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException();
    const openidKey: string | null = await this.cacheManager.get(
      `${this.appConfig.project.redisKeyPrefixLoginUserToken}${token}`,
    );
    if (!openidKey)
      throw new UnauthorizedException(
        this.codeService.business('AuthLoginExpiredError'),
      );
    const user = await this.cacheManager.get(openidKey);
    if (!user)
      throw new UnauthorizedException(
        this.codeService.business('AuthLoginExpiredError'),
      );
    const ttl = 30 * 60 * 1000;
    await this.updateRedisKeyTTL(
      `${this.appConfig.project.redisKeyPrefixLoginUserToken}${token}`,
      ttl,
    );
    await this.updateRedisKeyTTL(openidKey, ttl);
    return user;
  }

  async validateSignature(
    req: ExpressRequest,
    signature: string,
    signatureDate: string,
  ) {
    const signatureSplit = signature.split(/\s+/);
    if (signatureSplit.length < 2) {
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    const key = signatureSplit[0];
    const info = await this.authorizedCommonService.findDetailsByBusinessKey(
      key,
    );
    // 没有授权
    if (!info) {
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    // 授权被禁用
    if (info.isUsed === this.constantsConfig.constants.IsUsedNo) {
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    // console.log('---info', info);
    // 未进行接口授权
    if (info.apis.length < 1) {
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    // 验证 c.Method() + c.Path() 是否授权
    const table = this.newUtilsUrltable();
    for (let i = 0; i < info.apis.length; i++) {
      const item = info.apis[i];
      table.append(item.method + item.api);
    }
    //
    const method = req.method;
    const path = req.path;
    const mappingRes = table.mapping(method + path);
    if (!(mappingRes.success && mappingRes.data)) {
      // 未进行接口授权
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    // console.log('-----root', JSON.stringify(table.root));
    // console.log('----mappingRes', mappingRes);

    const body = req.body;
    const query = req.query;
    let params: Record<string, any> = {};
    switch (method.toLowerCase()) {
      case 'get':
      case 'head':
        params = query;
        break;
      default:
        // body可能不是对象类型
        if (!this.utilsService.isPureObject(body)) {
          throw new UnauthorizedException(
            this.codeService.business('AuthSignatureBodyTypeError'),
          );
        }
        params = {
          ...query,
          ...body,
        };
        break;
    }
    //
    const utilsSignature = this.utilsService.createSignature({
      key,
      secret: info.secret,
      ttl: this.appConfig.project.headerSignTokenTimeout,
    });
    const verifyRes = utilsSignature.verify(
      signature,
      signatureDate,
      path,
      method,
      params,
    );
    if (!(verifyRes.success && verifyRes.data)) {
      // 接口授权失败
      throw new UnauthorizedException(
        this.codeService.business('AuthSignatureError'),
      );
    }
    return verifyRes.data;
  }
}

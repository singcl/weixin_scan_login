import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  UnauthorizedException,
  GoneException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './../utils/services/utils.service';
import { UsersService } from './../users/users.service';
import { CodeService } from './../code/code.service';

import { config } from './../config';

@Injectable()
export class AuthService {
  constructor(
    private readonly codeService: CodeService,
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
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

  async validateSignature(signature: string, signatureDate: string) {
    // TODO:
  }
}

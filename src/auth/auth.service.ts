import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  UnauthorizedException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigType /* ConfigService */ } from '@nestjs/config';
import { UtilsService } from './../utils/services/utils.service';
import { UsersService } from './../users/users.service';

import { config } from './../config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly utilsService: UtilsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  ) {
    //
  }
  async validateScanSuccess(sessionKey?: string): Promise<any> {
    if (!sessionKey) {
      return {
        success: false,
        token: null,
      };
    }
    const openid: string = await this.cacheManager.get(sessionKey);
    if (!openid) {
      return {
        success: false,
        token: null,
      };
    }

    const res = await this.usersService.findOneByOpenId(openid);
    if (!res) {
      return {
        success: false,
        token: null,
      };
    }

    const salt = this.appConfig.params.weixinLoginSalt;
    const token = this.utilsService.genRandomToken(openid, salt);
    const ttl = 30 * 60 * 1000;
    // 设置两个缓存，同时记录同一个账号的登录数量
    const tokenKey = `wechat:login_user:${token}`;
    const openidKey = `wechat:login_openid:${openid}`;
    await this.cacheManager.set(tokenKey, res, ttl);
    const list: string[] | null = await this.cacheManager.get(openidKey);
    if (!list) {
      await this.cacheManager.set(openidKey, [tokenKey], ttl);
    } else {
      list.push(tokenKey);
      await this.cacheManager.set(openidKey, list, ttl);
    }
    await this.cacheManager.del(sessionKey);
    return {
      success: true,
      token: token,
    };
  }

  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException();
    const user = await this.cacheManager.get(`wechat:login:${token}`);
    if (!user) throw new UnauthorizedException();
    // TODO：更多业务判断
    return user;
  }
}

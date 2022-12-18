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
    const token = this.utilsService.getSha1(openid + salt);
    await this.cacheManager.set(`login_${token}`, res, 30 * 60 * 1000);
    await this.cacheManager.del(sessionKey);
    return {
      success: true,
      token: token,
    };
  }

  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException();
    const user = await this.cacheManager.get(`login_${token}`);
    if (!user) throw new UnauthorizedException();
    // TODO：更多业务判断
    return user;
  }
}

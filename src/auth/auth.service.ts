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
    // @see https://zhuanlan.zhihu.com/p/508554307
    // 一个账号能同时登录3台设备终极方案。
    // 1、同样的为一个账号登录的时候，都给其分配一个 token .
    // token在 redis中的对应关系还是【 key: token , value: userId 】，
    // 然后 userId 在 redis中的对应关系也还是【 key: userId , value: userInfo 】。
    // 但是 userInfo 里面不再是用户的基本信息了，这里面需要增加一个属性 loginTokenList ,用来保存此账号已经登录的 token 集合。
    // 2、当账号登录的时候，根据 userId 取出 userInfo ,然后拿到loginTokenList ，逐一判断 token 是否失效，
    // 然后简单判断一下过滤后的loginTokenListsize 即可。注意：这里更新 userInfo 信息时候同样是需要原子操作的（ lua 脚本），
    // 因为是登录，所以明显这里的并发要小很多，所以这里原子性的更新对 redis 系统几乎没有影响。
    // 3、当用户访问页面的时候，我们还是同样的根据 token 获取 userId ,
    //  再根据 userId 获取 userInfo 。这里同上，用户访问页面的时候尽量不要去检查和更新 userInfo 里的loginTokenList。
    const tokenKey = `wechat:login_user:${token}`;
    const openidKey = `wechat:login_openid:${openid}`;
    //
    await this.cacheManager.set(tokenKey, openidKey, ttl);
    const user: Record<string, any> | null = await this.cacheManager.get(
      openidKey,
    );
    if (!user) {
      await this.cacheManager.set(
        openidKey,
        {
          ...res,
          loginTokenList: [tokenKey],
        },
        ttl,
      );
    } else {
      const res2 = {
        ...user,
        loginTokenList: [...user.loginTokenList, tokenKey],
      };
      await this.cacheManager.set(openidKey, res2, ttl);
    }
    await this.cacheManager.del(sessionKey);
    return {
      success: true,
      token: token,
    };
  }

  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException();
    const openidKey: string | null = await this.cacheManager.get(
      `wechat:login_user:${token}`,
    );
    if (!openidKey) throw new UnauthorizedException();
    const user = await this.cacheManager.get(openidKey);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

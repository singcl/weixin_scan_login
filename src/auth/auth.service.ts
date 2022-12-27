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
    const openid: string = await this.cacheManager.get(sessionKey);
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
        `wechat:login_user:${cToken}`,
      );
      if (openidKey && openidKey === `wechat:login_openid:${openid}`) {
        const ttl = 30 * 60 * 1000;
        await this.updateRedisKeyTTL(`wechat:login_user:${cToken}`, ttl);
        await this.updateRedisKeyTTL(openidKey, ttl);
        await this.cacheManager.del(sessionKey);
        return this.codeService.business('Success', cToken);
      }
    }

    //
    // 设置两个缓存，同时记录同一个账号的登录数量
    // @see https://zhuanlan.zhihu.com/p/508554307
    // 同一个账号能同时登录3台设备方案。
    // 1、同样的为一个账号登录的时候，都给其分配一个 token .
    // token在 redis中的对应关系还是【 key: token , value: userId 】，
    // 然后 userId 在 redis中的对应关系也还是【 key: userId , value: userInfo 】。
    // 但是 userInfo 里面不再是用户的基本信息了，这里面需要增加一个属性 loginTokenList ,用来保存此账号已经登录的 token 集合。
    // 2、当账号登录的时候，根据 userId 取出 userInfo ,然后拿到loginTokenList ，逐一判断 token 是否失效，
    // 然后简单判断一下过滤后的loginTokenListSize 即可。注意：这里更新 userInfo 信息时候同样是需要原子操作的（ lua 脚本），
    // 因为是登录，所以明显这里的并发要小很多，所以这里原子性的更新对 redis 系统几乎没有影响。
    // 3、当用户访问页面的时候，我们还是同样的根据 token 获取 userId ,
    //  再根据 userId 获取 userInfo 。这里同上，用户访问页面的时候尽量不要去检查和更新 userInfo 里的loginTokenList。
    //
    const openidKey = `wechat:login_openid:${openid}`;

    const salt = this.appConfig.params.weixinLoginSalt;
    const token = this.utilsService.genRandomToken(openid, salt);
    const ttl = 30 * 60 * 1000;
    const tokenKey = `wechat:login_user:${token}`;
    const userInfo: Record<string, any> | null = await this.cacheManager.get(
      openidKey,
    );
    if (userInfo) {
      const loginTokenList: string[] = userInfo.loginTokenList || [];
      const loginTokenList2: string[] = [];
      for (let i = 0; i < loginTokenList.length; i++) {
        const tkKey = loginTokenList[i];
        const oId = await this.cacheManager.get(tkKey);
        if (oId) {
          loginTokenList2.push(tkKey);
        }
      }
      if (loginTokenList2.length >= 5) {
        throw new GoneException(
          this.codeService.business('AuthLoginCountError'),
        );
      }
      userInfo.loginTokenList = loginTokenList2;
      await this.cacheManager.set(
        openidKey,
        {
          ...userInfo,
          loginTokenList: [...loginTokenList2, tokenKey],
        },
        ttl,
      );
    } else {
      await this.cacheManager.set(
        openidKey,
        {
          ...res,
          loginTokenList: [tokenKey],
        },
        ttl,
      );
    }
    //
    await this.cacheManager.set(tokenKey, openidKey, ttl);
    await this.cacheManager.del(sessionKey);
    return this.codeService.business('Success', token);
  }

  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException();
    const openidKey: string | null = await this.cacheManager.get(
      `wechat:login_user:${token}`,
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
    await this.updateRedisKeyTTL(`wechat:login_user:${token}`, ttl);
    await this.updateRedisKeyTTL(openidKey, ttl);
    return user;
  }
}

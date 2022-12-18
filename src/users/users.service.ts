import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ConfigType /* ConfigService */ } from '@nestjs/config';

import { User } from './user.entity';
import { UtilsService } from '../utils/services/utils.service';
import { config } from './../config';

@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  ) {}

  async findOneByOpenId(openid: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ openid });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async createWxUser(openid: string, ticket: string) {
    let res = await this.findOneByOpenId(openid);
    //
    if (!res) {
      const user = new User();
      user.mobile = '130xxxxxxxx';
      user.openid = openid;
      user.nickname = `微信用户${this.utilsService.getRandomStr()}`;
      res = await this.save(user);
    }

    const salt = this.appConfig.params.weixinLoginSalt;
    const sessionKey = this.utilsService.getSha1(ticket + salt);
    await this.cacheManager.set(sessionKey, openid, 10 * 1000);
    return res;
  }
}

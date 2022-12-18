import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UtilsService } from '../utils/services/utils.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByOpenId(openid: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ openid });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async createWxUser(openid: string) {
    const res = await this.findOneByOpenId(openid);
    if (res) return res;
    //
    const user = new User();
    user.mobile = '130xxxxxxxx';
    user.openid = openid;
    user.nickname = `微信用户${this.utilsService.getRandomStr()}`;
    return this.save(user);
  }
}

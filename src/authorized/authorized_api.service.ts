import {
  Injectable,
  // Inject,
  // CACHE_MANAGER,
  // GoneException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Cache } from 'cache-manager';
// import { ConfigType /* ConfigService */ } from '@nestjs/config';

import { AuthorizedAPI } from './authorized_api.entity';
// import { UtilsService } from '../utils/services/utils.service';
// import { CodeService } from './../code/code.service';
// import { config } from './../config';

@Injectable()
export class AuthorizedAPIService {
  constructor(
    // private readonly utilsService: UtilsService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    // private readonly codeService: CodeService,
    @InjectRepository(AuthorizedAPI)
    private authorizedAPIRepository: Repository<AuthorizedAPI>,
  ) {
    //
  }
  async findByBusinessKey(
    businessKey: string,
  ): Promise<AuthorizedAPI[] | null> {
    return this.authorizedAPIRepository.findBy({ businessKey, isDeleted: -1 });
  }
}

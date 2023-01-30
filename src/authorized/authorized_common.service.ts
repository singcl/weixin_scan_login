import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  // GoneException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigType /* ConfigService */ } from '@nestjs/config';

// import { UtilsService } from '../utils/services/utils.service';
// import { CodeService } from './../code/code.service';
import { AuthorizedAPIService } from './authorized_api.service';
import { AuthorizedService } from './authorized.service';
import { config } from './../config';
import { CacheAuthorizedData } from './dtos/authorized.dto';

@Injectable()
export class AuthorizedCommonService {
  constructor(
    // private readonly utilsService: UtilsService,
    // private readonly codeService: CodeService,
    private readonly authorizedService: AuthorizedService,
    private readonly authorizedAPIService: AuthorizedAPIService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  ) {}
  //
  async findDetailsByBusinessKey(
    businessKey: string,
  ): Promise<CacheAuthorizedData | null> {
    const cacheKey =
      this.appConfig.project.redisKeyPrefixSignature + businessKey;
    // 查询缓存
    const cacheSignature = await this.cacheManager.get<CacheAuthorizedData>(
      cacheKey,
    );
    if (cacheSignature) return cacheSignature;

    // 查询调用方信息
    const authorizedInfo = await this.authorizedService.findOneByBusinessKey(
      businessKey,
    );
    if (!authorizedInfo) return null;
    // 查询调用方授权 API 信息
    const authorizedApiInfo = await this.authorizedAPIService.findByBusinessKey(
      businessKey,
    );
    if (!authorizedApiInfo) return null;
    // 生成信息
    const cacheData: CacheAuthorizedData = {
      key: businessKey,
      secret: authorizedInfo.businessSecret,
      isUsed: authorizedInfo.isUsed,
      apis: authorizedApiInfo.map((item) => ({
        method: item.method,
        api: item.api,
      })),
    };
    await this.cacheManager.set(
      cacheKey,
      cacheData,
      this.appConfig.project.loginSessionTTL,
    );
    return cacheData;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { ConfigType /* ConfigService */ } from '@nestjs/config';

import { config } from './../config';
import { UtilsService } from '../utils/services/utils.service';

@Injectable()
export class MiniSdkService {
  constructor(
    private readonly utilsService: UtilsService,
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
  ) {}
}

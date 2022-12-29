import { Module, Global } from '@nestjs/common';

import { UtilsService } from './services/utils.service';

@Global()
@Module({
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}

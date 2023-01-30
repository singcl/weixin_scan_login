import { Module, Global } from '@nestjs/common';

import { UtilsUrltable } from './services/utils-urltable';
import { UtilsService } from './services/utils.service';

@Global()
@Module({
  providers: [
    UtilsService,
    {
      provide: 'URL_TABLE',
      useFactory: () => {
        return new UtilsUrltable();
      },
    },
  ],
  exports: [UtilsService, 'URL_TABLE'],
})
export class UtilsModule {}

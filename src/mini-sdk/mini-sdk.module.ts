import { Module } from '@nestjs/common';
import { MiniSdkService } from './mini-sdk.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  providers: [MiniSdkService, UtilsModule],
  exports: [MiniSdkService],
})
export class MiniSdkModule {
  //
}

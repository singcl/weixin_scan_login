import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MiniSdkService } from './mini-sdk.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [UtilsModule, HttpModule],
  providers: [MiniSdkService],
  exports: [MiniSdkService],
})
export class MiniSdkModule {
  //
}

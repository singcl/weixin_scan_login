import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MiniSdkService } from './mini-sdk.service';

@Module({
  imports: [HttpModule],
  providers: [MiniSdkService],
  exports: [MiniSdkService],
})
export class MiniSdkModule {
  //
}

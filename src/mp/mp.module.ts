/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Module, MiddlewareConsumer } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
import * as bodyParser from 'body-parser';
import * as bodyParserXML from 'body-parser-xml';

import { MpService } from './mp.service';
import { MpController } from './mp.controller';

import { UtilsModule } from '../utils/utils.module';
import { UsersModule } from '../users/users.module';
import { MiniSdkModule } from '../mini-sdk/mini-sdk.module';

bodyParserXML(bodyParser);

@Module({
  imports: [UtilsModule, /* HttpModule, */ UsersModule, MiniSdkModule],
  providers: [MpService],
  controllers: [MpController],
})
export class MpModule {
  configure(consumer: MiddlewareConsumer) {
    // @ts-ignore
    consumer.apply(bodyParser.xml()).forRoutes(MpController);
  }
}

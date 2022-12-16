/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Module, MiddlewareConsumer, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as bodyParserXML from 'body-parser-xml';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './utils/utils.module';

import { config, /*  environments, */ validationSchema } from './config';

bodyParserXML(bodyParser);

@Module({
  imports: [
    CacheModule.register({
      // @ts-ignore
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    ConfigModule.forRoot({
      // envFilePath: environments[`${process.env.NODE_ENV}`],
      // ignoreEnvFile: process.env.NODE_ENV === 'production' || false,
      load: [config],
      isGlobal: true,
      validationSchema,
    }),
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // @ts-ignore
    consumer.apply(bodyParser.xml()).forRoutes(AppController);
  }
}

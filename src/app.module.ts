/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Module, MiddlewareConsumer, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as bodyParserXML from 'body-parser-xml';
import { redisStore } from 'cache-manager-redis-yet';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './utils/utils.module';

import { config, /*  environments, */ validationSchema } from './config';
import { User } from './user.entity';

bodyParserXML(bodyParser);

@Module({
  imports: [
    CacheModule.register({
      // @ts-ignore
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    ConfigModule.forRoot({
      // envFilePath: environments[`${process.env.NODE_ENV}`],
      // ignoreEnvFile: process.env.NODE_ENV === 'production' || false,
      load: [config],
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'gin',
      password: 'password',
      database: 'wx_scan_login',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    UtilsModule,
    HttpModule,
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

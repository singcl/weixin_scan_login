/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as bodyParserXML from 'body-parser-xml';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './utils/utils.module';

import { config, /*  environments, */ validationSchema } from './config';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import Cache from './cache/cache.module';

bodyParserXML(bodyParser);

@Module({
  imports: [
    Cache,
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
    UtilsModule,
    HttpModule,
    AuthModule,
    UsersModule,
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

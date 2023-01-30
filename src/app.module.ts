/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { config, constants, environments, validationSchema } from './config';
import { AuthModule } from './auth/auth.module';
import { MpModule } from './mp/mp.module';
import { MiniSdkModule } from './mini-sdk/mini-sdk.module';
import { CodeModule } from './code/code.module';
import { AuthorizedModule } from './authorized/authorized.module';
import { UtilsModule } from './utils/utils.module';

import { User } from './users/user.entity';
import { AuthorizedAPI } from './authorized/authorized_api.entity';
import { Authorized } from './authorized/authorized.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[`${process.env.NODE_ENV}`],
      // ignoreEnvFile: process.env.NODE_ENV === 'production' || false,
      load: [config, constants],
      isGlobal: true,
      validationSchema,
    }),
    CacheModule.register({
      // @ts-ignore
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'gin',
    //   password: 'password',
    //   database: 'wx_scan_login',
    //   entities: [User],
    //   synchronize: true,
    // }),
    // @see https://github.com/Tony133/nestjs-api-boilerplate-jwt/blob/main/src/app.module.ts
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('MYSQL_HOST'),
        port: config.get('MYSQL_PORT'),
        username: config.get('MYSQL_USERNAME'),
        password: config.get('MYSQL_PASSWORD'),
        database: config.get('MYSQL_DATABASE'),
        entities: [User, AuthorizedAPI, Authorized],
        synchronize: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    AuthModule,
    MpModule,
    MiniSdkModule,
    CodeModule,
    UtilsModule,
    AuthorizedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

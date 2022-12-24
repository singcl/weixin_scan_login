import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { config, /*  environments, */ validationSchema } from './config';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { MpModule } from './mp/mp.module';
import { MiniSdkModule } from './mini-sdk/mini-sdk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: environments[`${process.env.NODE_ENV}`],
      // ignoreEnvFile: process.env.NODE_ENV === 'production' || false,
      load: [config],
      isGlobal: true,
      validationSchema,
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
        entities: [User],
        synchronize: true,
      }),
    }),
    AuthModule,
    MpModule,
    MiniSdkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

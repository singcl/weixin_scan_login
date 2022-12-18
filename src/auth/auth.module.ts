import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './../users/users.module';
import { UtilsModule } from './../utils/utils.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import Cache from '../cache/cache.module';

@Module({
  imports: [UsersModule, PassportModule, Cache, UtilsModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

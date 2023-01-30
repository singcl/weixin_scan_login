import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './../users/users.module';
import { AuthorizedModule } from './../authorized/authorized.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { TokenStrategy } from './token.strategy';

@Module({
  imports: [UsersModule, PassportModule, AuthorizedModule],
  providers: [AuthService, LocalStrategy, TokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}

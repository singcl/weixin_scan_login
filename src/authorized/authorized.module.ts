import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Authorized } from './authorized.entity';
import { AuthorizedAPI } from './authorized_api.entity';
import { AuthorizedService } from './authorized.service';
import { AuthorizedController } from './authorized.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Authorized, AuthorizedAPI])],
  providers: [AuthorizedService],
  exports: [AuthorizedService],
  controllers: [AuthorizedController],
})
export class AuthorizedModule {}

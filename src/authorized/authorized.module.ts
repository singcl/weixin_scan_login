import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Authorized } from './authorized.entity';
import { AuthorizedAPI } from './authorized_api.entity';
import { AuthorizedService } from './authorized.service';
import { AuthorizedAPIService } from './authorized_api.service';
import { AuthorizedCommonService } from './authorized_common.service';
import { AuthorizedController } from './authorized.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Authorized, AuthorizedAPI])],
  providers: [AuthorizedService, AuthorizedAPIService, AuthorizedCommonService],
  exports: [AuthorizedService, AuthorizedAPIService, AuthorizedCommonService],
  controllers: [AuthorizedController],
})
export class AuthorizedModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Authorized } from './authorized.entity';
import { AuthorizedService } from './authorized.service';
import { AuthorizedController } from './authorized.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Authorized])],
  providers: [AuthorizedService],
  exports: [AuthorizedService],
  controllers: [AuthorizedController],
})
export class AuthorizedModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UtilsModule } from '../utils/utils.module';
import Cache from './../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UtilsModule, Cache],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

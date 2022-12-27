import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UtilsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

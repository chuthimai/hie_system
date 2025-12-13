import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UsersModule {}

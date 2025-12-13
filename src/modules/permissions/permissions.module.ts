import { Module } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { UsersModule } from '../users/users.module';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    UsersModule,
    HospitalsModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionService],
  exports: [TypeOrmModule, PermissionService],
})
export class PermissionsModule {}

import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { UsersModule } from '../users/users.module';
import { S3Module } from '../s3/s3.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { EthersModule } from '../ethers/ethers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientRecord]),
    HospitalsModule,
    UsersModule,
    PermissionsModule,
    S3Module,
    EthersModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [TypeOrmModule, RecordsService],
})
export class RecordsModule {}

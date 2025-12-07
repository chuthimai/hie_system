import { Module } from '@nestjs/common';
import { HospitalService } from './hospitals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { HospitalsController } from './hospitals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],
  controllers: [HospitalsController],
  providers: [HospitalService],
  exports: [TypeOrmModule, HospitalService],
})
export class HospitalsModule {}

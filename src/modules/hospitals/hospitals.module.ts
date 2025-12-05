import { Module } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],
  controllers: [],
  providers: [HospitalsService],
  exports: [TypeOrmModule, HospitalsService],
})
export class HospitalsModule {}

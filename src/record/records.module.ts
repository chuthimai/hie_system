import { Module } from '@nestjs/common';
import { RecordsController } from './record.controller';
import { RecordsService } from './records.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRecord } from './entities/patient-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientRecord])],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [TypeOrmModule, RecordsService],
})
export class RecordsModule {}

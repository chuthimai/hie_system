import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRecordRepository: Repository<PatientRecord>,
  ) {}
}

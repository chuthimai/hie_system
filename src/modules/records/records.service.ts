import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { HospitalsService } from '../hospitals/hospitals.service';
import { UsersService } from '../users/users.service';
import { S3Service } from '../s3/s3.services';
import { keccak256, solidityPacked } from 'ethers';
import { getCurrentDateTime } from 'src/helpers/converter';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRecordRepository: Repository<PatientRecord>,
    private readonly hospitalsService: HospitalsService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  async findOne(identifier: number): Promise<PatientRecord | null> {
    return this.patientRecordRepository.findOneBy({
      identifier,
    });
  }

  async findAllByPatientIdentifier(patientIdentifier: number): Promise<any> {}

  async createRecord(
    createRecordDto: CreateRecordDto,
    record: Express.Multer.File,
  ): Promise<{ fileId: number; fileHash: string }> {
    const existedHospital = await this.hospitalsService.findOne(
      createRecordDto.hospitalIdentifier,
    );
    if (!existedHospital)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.HOSPITAL_NOT_FOUND);

    const existedPatient = await this.usersService.findOne(
      createRecordDto.patientIdentifier,
    );
    if (!existedPatient)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PATIENT_NOT_FOUND);

    console.log('Got here');

    const packed = solidityPacked(
      ['uint256', 'uint256', 'bytes'],
      [
        createRecordDto.hospitalIdentifier,
        createRecordDto.patientIdentifier,
        record.buffer,
      ],
    );

    const fileName = `record_${createRecordDto.patientIdentifier}_${getCurrentDateTime()}.pdf`;
    const fileHash = keccak256(packed);

    const newPatientRecord = this.patientRecordRepository.create({
      name: fileName,
      hash: fileHash,
      patientIdentifier: createRecordDto.patientIdentifier,
      hospitalIdentifier: createRecordDto.hospitalIdentifier,
    });
    await this.patientRecordRepository.save(newPatientRecord);
    await this.s3Service.uploadBuffer(fileName, record);

    return { fileId: newPatientRecord.identifier, fileHash };
  }

  async updateRecord(
    recordIdentifier: number,
    fileHash: string,
    blockId: number,
    transactionId: number,
  ): Promise<void> {
    let existedRecord = await this.findOne(recordIdentifier);
    if (!existedRecord)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.RECORD_NOT_FOUND);

    existedRecord = {
      ...existedRecord,
      blockId: blockId,
      transactionId: transactionId,
      hash: fileHash,
    };
    await this.patientRecordRepository.save(existedRecord);
  }
}

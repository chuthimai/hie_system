import { Injectable } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { HospitalService } from '../hospitals/hospitals.service';
import { UserService } from '../users/users.service';
import { S3Service } from '../s3/s3.services';
import { getCurrentDateTime } from 'src/helpers/converter';
import { GetRecordsByPatientDto } from './dto/get-records-by-patient.dto';
import { PermissionService } from '../permissions/permissions.service';
import { EthersService } from '../ethers/ethers.service';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRecordRepository: Repository<PatientRecord>,
    private readonly hospitalService: HospitalService,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly s3Service: S3Service,
    private readonly etherService: EthersService,
  ) {}

  async findOne(identifier: number): Promise<PatientRecord | null> {
    return this.patientRecordRepository.findOneBy({
      identifier,
    });
  }

  async findAllByPatientIdentifier(
    patientIdentifier: number,
  ): Promise<PatientRecord[]> {
    return await this.patientRecordRepository.find({
      where: {
        patientIdentifier,
        blockId: Not(IsNull()),
        transactionId: Not(IsNull()),
      },
      relations: ['hospital'],
    });
  }

  async findAllByCurrentUser(userIdentifier: number): Promise<PatientRecord[]> {
    const records = await this.findAllByPatientIdentifier(userIdentifier);
    const isValid = await this.validRecords(records);
    if (!isValid) {
      throw new HttpExceptionWrapper(ERROR_MESSAGES.RECORD_MODIFIED);
    }

    return await Promise.all(
      records.map(async (record) => {
        record.link = await this.s3Service.getSignedUrl(record.name);
        return record;
      }),
    );
  }

  async findAllByCondition(
    getRecordsByPatient: GetRecordsByPatientDto,
  ): Promise<PatientRecord[]> {
    const existedPermission =
      await this.permissionService.findOneByUserAndHospital(
        getRecordsByPatient.patientIdentifier,
        getRecordsByPatient.hospitalIdentifier,
      );
    if (!existedPermission)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PERMISSION_DENIED);
    else if (existedPermission.expiredTime < new Date())
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PERMISSION_EXPIRED);

    const records = await this.findAllByPatientIdentifier(
      getRecordsByPatient.patientIdentifier,
    );
    const isValid = await this.validRecords(records);
    if (!isValid) {
      throw new HttpExceptionWrapper(ERROR_MESSAGES.RECORD_MODIFIED);
    }

    return await Promise.all(
      records.map(async (record) => {
        record.link = await this.s3Service.getSignedUrl(record.name);
        return record;
      }),
    );
  }

  async createRecord(
    createRecordDto: CreateRecordDto,
    record: Express.Multer.File,
  ): Promise<{ fileId: number; fileHash: string; fileSignature: string }> {
    const existedHospital = await this.hospitalService.findOne(
      createRecordDto.hospitalIdentifier,
    );
    if (!existedHospital)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.HOSPITAL_NOT_FOUND);

    const existedPatient = await this.userService.findOne(
      createRecordDto.patientIdentifier,
    );
    if (!existedPatient)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PATIENT_NOT_FOUND);

    const fileName = `record_${createRecordDto.patientIdentifier}_${getCurrentDateTime()}.pdf`;
    const fileBuffer = Buffer.from(record.buffer);
    const fileHash = this.etherService.hashPayload(
      createRecordDto.hospitalIdentifier,
      createRecordDto.patientIdentifier,
      fileBuffer,
    );
    const fileSignature = await this.etherService.signPayload(fileHash);

    const newPatientRecord = this.patientRecordRepository.create({
      name: fileName,
      hash: fileHash,
      patientIdentifier: createRecordDto.patientIdentifier,
      hospitalIdentifier: createRecordDto.hospitalIdentifier,
    });
    await this.patientRecordRepository.save(newPatientRecord);
    await this.s3Service.uploadBuffer(fileName, fileBuffer);

    return { fileId: newPatientRecord.identifier, fileHash, fileSignature };
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

  async validRecords(records: PatientRecord[]): Promise<boolean> {
    const fileList: Buffer[] = [];
    for (const record of records) {
      const fileWithMeta = (await this.s3Service.getFileWithMetadata(
        record.name,
      )) as Buffer;

      const targetHash = this.etherService.hashPayload(
        record.hospitalIdentifier,
        record.patientIdentifier,
        fileWithMeta,
      );
      if (targetHash === record.hash) fileList.push(fileWithMeta);
      else break;
    }

    return fileList.length == records.length;
  }
}

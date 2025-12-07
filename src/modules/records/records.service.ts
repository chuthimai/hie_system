import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientRecord } from './entities/patient-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRecordDto } from './dto/create-record.dto';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { HospitalService } from '../hospitals/hospitals.service';
import { UserService } from '../users/users.service';
import { S3Service } from '../s3/s3.services';
import { keccak256, solidityPacked } from 'ethers';
import { getCurrentDateTime } from 'src/helpers/converter';
import { GetRecordsByPatientDto } from './dto/get-records-by-patient.dto';
import { PermissionService } from '../permissions/permissions.service';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(PatientRecord)
    private readonly patientRecordRepository: Repository<PatientRecord>,
    private readonly hospitalService: HospitalService,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly s3Service: S3Service,
  ) {}

  async findOne(identifier: number): Promise<PatientRecord | null> {
    return this.patientRecordRepository.findOneBy({
      identifier,
    });
  }

  async findAllByPatient(
    getRecordsByPatient: GetRecordsByPatientDto,
  ): Promise<any> {
    const existedPermission =
      await this.permissionService.findOneByUserAndHospital(
        getRecordsByPatient.patientIdentifier,
        getRecordsByPatient.hospitalIdentifier,
      );
    if (!existedPermission)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PERMISSION_DENIED);
    else if (existedPermission.expiredTime < new Date())
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PERMISSION_EXPIRED);

    const records = await this.patientRecordRepository.findBy({
      hospitalIdentifier: getRecordsByPatient.hospitalIdentifier,
      patientIdentifier: getRecordsByPatient.patientIdentifier,
    });

    const fileList: Buffer[] = [];
    for (const record of records) {
      const fileWithMeta = (await this.s3Service.getFileWithMetadata(
        record.name,
      )) as Buffer;

      const targetHash = this.hashInfo(
        record.hospitalIdentifier,
        record.patientIdentifier,
        fileWithMeta,
      );
      if (targetHash === record.hash) fileList.push(fileWithMeta);
      else break;
    }

    if (fileList.length !== records.length)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.RECORD_MODIFIED);

    const finalFileName = `records_${getRecordsByPatient.patientIdentifier}_${getCurrentDateTime()}.pdf`;
    const finalFileBuffer = await this.mergeBuffers(fileList);

    await this.s3Service.uploadBuffer(finalFileName, finalFileBuffer);
    return await this.s3Service.getSignedUrl(finalFileName);
  }

  async createRecord(
    createRecordDto: CreateRecordDto,
    record: Express.Multer.File,
  ): Promise<{ fileId: number; fileHash: string }> {
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
    const fileHash = this.hashInfo(
      createRecordDto.hospitalIdentifier,
      createRecordDto.patientIdentifier,
      fileBuffer,
    );

    const newPatientRecord = this.patientRecordRepository.create({
      name: fileName,
      hash: fileHash,
      patientIdentifier: createRecordDto.patientIdentifier,
      hospitalIdentifier: createRecordDto.hospitalIdentifier,
    });
    await this.patientRecordRepository.save(newPatientRecord);
    await this.s3Service.uploadBuffer(fileName, fileBuffer);

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

  hashInfo(
    hospitalIdentifier: number,
    patientIdentifier: number,
    record: Buffer,
  ): string {
    const packed = solidityPacked(
      ['uint256', 'uint256', 'bytes'],
      [hospitalIdentifier, patientIdentifier, `0x${record.toString('hex')}`],
    );
    return keccak256(packed);
  }

  async mergeBuffers(fileList: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBytes of fileList) {
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((p) => mergedPdf.addPage(p));
    }

    await mergedPdf.save();
    return Buffer.from(await mergedPdf.save());
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
import { CreateRecordDto } from './dto/create-record.dto';
import { GetRecordsByPatientDto } from './dto/get-records-by-patient.dto';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('/by-patient')
  getAllsByPatientIdentifier(
    @Body() getRecordsByPatient: GetRecordsByPatientDto,
  ) {
    return this.recordsService.findAllByPatient(getRecordsByPatient);
  }

  @Post('/')
  @UseInterceptors(FileUploadInterceptor('record'))
  create(
    @Body() createRecordDto: CreateRecordDto,
    @UploadedFile() record: Express.Multer.File,
  ) {
    return this.recordsService.createRecord(createRecordDto, record);
  }
}

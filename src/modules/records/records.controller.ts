import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
import { CreateRecordDto } from './dto/create-record.dto';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get('/')
  getAllsByPatientIdentifier(
    @Param('patientIdentifier') patientIdentifier: number,
  ) {
    return this.recordsService.findAllByPatientIdentifier(patientIdentifier);
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

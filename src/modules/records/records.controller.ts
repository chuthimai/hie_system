import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
import { CreateRecordDto } from './dto/create-record.dto';
import { GetRecordsByPatientDto } from './dto/get-records-by-patient.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator.dto';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/by-current-user')
  getAllsByPatientCurrentUser(@CurrentUser() currentUser: User) {
    return this.recordsService.findAllByCurrentUser(currentUser.identifier);
  }

  @Post('/by-patient')
  getAllsByPatient(@Body() getRecordsByPatient: GetRecordsByPatientDto) {
    return this.recordsService.findAllByCondition(getRecordsByPatient);
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

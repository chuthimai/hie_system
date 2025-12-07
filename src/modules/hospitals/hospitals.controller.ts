import { Controller, Get } from '@nestjs/common';
import { HospitalService } from './hospitals.service';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get('/')
  getAll() {
    return this.hospitalService.findAll();
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { HospitalService } from './hospitals.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalService: HospitalService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAll() {
    return this.hospitalService.findAll();
  }
}

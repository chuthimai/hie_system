import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { UserService } from '../users/users.service';
import { HospitalService } from '../hospitals/hospitals.service';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly userService: UserService,
    private readonly hospitalService: HospitalService,
  ) {}

  async findOneByUserAndHospital(
    userIdentifier: number,
    hospitalIdentifier: number,
  ): Promise<Permission | null> {
    const existedHospital =
      await this.hospitalService.findOne(hospitalIdentifier);
    if (!existedHospital)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.HOSPITAL_NOT_FOUND);

    const existedPatient = await this.userService.findOne(userIdentifier);
    if (!existedPatient)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PATIENT_NOT_FOUND);

    return await this.permissionRepository.findOneBy({
      userIdentifier,
      hospitalIdentifier,
    });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existedHospital = await this.hospitalService.findOne(
      createPermissionDto.hospitalIdentifier,
    );
    if (!existedHospital)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.HOSPITAL_NOT_FOUND);

    const existedPatient = await this.userService.findOne(
      createPermissionDto.userIdentifier,
    );
    if (!existedPatient)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.PATIENT_NOT_FOUND);

    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator.dto';
import { User } from '../users/entities/user.entity';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.permissionService.create(
      createPermissionDto,
      currentUser.identifier,
    );
  }
}

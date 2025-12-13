import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  hospitalIdentifier: number;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  identifier: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}

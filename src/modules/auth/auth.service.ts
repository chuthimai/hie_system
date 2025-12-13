import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { UserService } from '../users/users.service';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { HttpExceptionWrapper } from 'src/helpers/wrapper';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const existedUser = await this.userService.findOne(loginDto.identifier);
    if (!existedUser)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.USER_NOT_FOUND);

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      existedUser.password as string,
    );
    if (!isValidPassword)
      throw new HttpExceptionWrapper(ERROR_MESSAGES.INVALID_PASSWORD);

    const payload = { id: existedUser.identifier };
    const token = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = existedUser;
    return { ...userWithoutPassword, token };
  }
}

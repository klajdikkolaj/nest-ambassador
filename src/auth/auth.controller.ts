import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  @Post('admin/register')
  async register(@Body() body: RegisterDto) {
    const { pass_confirm, ...data } = body;
    if (body.password != pass_confirm) {
      throw new BadRequestException('passes do not match');
    }

    const hashed = await bcrypt.hash(body.password, 12);

    return this.userService.save({
      ...data,
      password: hashed,
      is_ambassador: false,
    });
  }

  @Post('admin/login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ email: body.email });
    if (!user) {
      throw new NotFoundException('no user found with this email');
    }
    if (!(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestException('Wrong pass');
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
    });
    response.cookie('jwt', jwt, { httpOnly: true });
    return {
      message: 'success',
    };
  }

  @UseGuards(AuthGuard)
  @Get('admin/user')
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);
    return await this.userService.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Post('admin/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return {
      message: 'success',
    };
  }

  @UseGuards(AuthGuard)
  @Put('admin/users/info')
  async updateInfo(
    @Req() request: Request,
    @Body('first_name') first_name: string,
    @Body('last_name') last_name: string,
    @Body('email') email: string,
  ) {
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);
    await this.userService.update(id, {
      first_name,
      last_name,
      email,
    });
    return await this.userService.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Put('admin/users/password')
  async updatePassword(
    @Req() request: Request,
    @Body('password') password: string,
    @Body('pass_confirm') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Password does not match');
    }
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);
    await this.userService.update(id, {
      password: await bcrypt.hash(password, 12),
    });
    return await this.userService.findOne({ id });
  }
}

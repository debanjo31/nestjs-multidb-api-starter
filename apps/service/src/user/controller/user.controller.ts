import {
  Controller,
  Get,
  HttpCode,
  Next,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import {
  Auth,
  BaseController,
  CurrentUser,
  JwtAuthGuard,
  OK,
} from '@shared/core';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../service/user.service';

@ApiTags('User')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController extends BaseController {
  constructor(protected service: UserService, protected config: ConfigService) {
    super(config, service);
  }

  @Get('/me')
  @HttpCode(OK)
  public async currentUser(
    @CurrentUser() auth: Auth,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const value = await this.service.currentUser(auth._id);
      const response = await this.service.getResponse({
        code: OK,
        value,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Next,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import {
  AdminJwtAuthGuard,
  AdminSignInDto,
  AdminSignUpDto,
  BaseController,
  CurrentUser,
  OK,
  QueryParser,
} from '@shared/core';
import { AdminAuthService } from '../service/admin-auth.service';
import lang from 'apps/admin/lang';

@ApiTags('Admin Auth')
@Controller('auth')
export class AdminAuthController extends BaseController {
  constructor(
    protected service: AdminAuthService,
    protected config: ConfigService,
  ) {
    super(config, service);
  }

  @Post('/init')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Initialize admin account', description: 'Create a new admin account' })
  @ApiBody({ type: AdminSignUpDto })
  @ApiResponse({ status: 200, description: 'Admin account created successfully' })
  @ApiResponse({ status: 409, description: 'Admin with this email already exists' })
  async signUp(
    @Body() signUpDto: AdminSignUpDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const { admin, token } = await this.service.signUp(signUpDto);

      const response = await this.service.getResponse({
        code: OK,
        token,
        queryParser,
        value: admin,
        message: lang.get('admin').created,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/sign-in')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Admin sign in', description: 'Authenticate admin with email and password' })
  @ApiBody({ type: AdminSignInDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account deactivated' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async signIn(
    @Body() signInDto: AdminSignInDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const { admin, token } = await this.service.signIn(signInDto);

      const response = await this.service.getResponse({
        code: OK,
        token,
        queryParser,
        value: admin,
        message: lang.get('admin').loggedIn,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/current')
  @HttpCode(OK)
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current admin', description: 'Get the currently authenticated admin profile' })
  @ApiResponse({ status: 200, description: 'Returns admin profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async currentAdmin(
    @CurrentUser() admin: any,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const profile = await this.service.getProfile(admin._id);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: profile,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }
}

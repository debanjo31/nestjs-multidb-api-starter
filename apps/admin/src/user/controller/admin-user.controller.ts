import {
  Controller,
  Get,
  HttpCode,
  Next,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { AdminJwtAuthGuard, BaseController, OK, Pagination, QueryParser } from '@shared/core';
import { AdminUserService } from '../service/admin-user.service';
import lang from 'apps/admin/lang';

@ApiTags('Admin Users')
@Controller('users')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminUserController extends BaseController {
  constructor(
    protected service: AdminUserService,
    protected config: ConfigService,
  ) {
    super(config, service);
  }

  @Get('/')
  @HttpCode(OK)
  @ApiOperation({ summary: 'List all users', description: 'Get paginated list of all users with optional filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by email or publicId' })
  @ApiQuery({ name: 'profileType', required: false, enum: ['User', 'Merchant'], description: 'Filter by profile type' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const result = await this.service.findAllUsers(query);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: result.data,
        pagination: result.pagination as unknown as Pagination,
        message: lang.get('user').list,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/stats')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Get user statistics', description: 'Get count statistics for users by profile type' })
  @ApiResponse({ status: 200, description: 'Returns user statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const stats = await this.service.getUserStats();

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: stats,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/:id')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Get user by ID', description: 'Get a single user by their MongoDB ID' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const user = await this.service.findUserById(id);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: user,
        message: lang.get('user').retrieved,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/public/:publicId')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Get user by public ID', description: 'Get a single user by their public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID (e.g., usr_abc123)' })
  @ApiResponse({ status: 200, description: 'Returns user details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByPublicId(
    @Param('publicId') publicId: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const user = await this.service.findUserByPublicId(publicId);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: user,
        message: lang.get('user').retrieved,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Patch('/:id/deactivate')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Deactivate user', description: 'Deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivate(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const result = await this.service.deactivateUser(id);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: result,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Patch('/:id/activate')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Activate user', description: 'Activate a previously deactivated user account' })
  @ApiParam({ name: 'id', description: 'User MongoDB ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activate(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const result = await this.service.activateUser(id);

      const response = await this.service.getResponse({
        code: OK,
        queryParser,
        value: result,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }
}

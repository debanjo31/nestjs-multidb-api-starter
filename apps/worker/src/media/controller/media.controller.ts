import {
  Controller,
  Get,
  HttpCode,
  Injectable,
  Next,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import {
  Auth,
  BaseController,
  CurrentUser,
  JwtAuthGuard,
  OK,
  QueryParser,
} from '@shared/core';
import { NextFunction, Request, Response } from 'express';
import { MediaService } from '../service/media.service';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController extends BaseController {
  constructor(
    protected service: MediaService,
    protected config: ConfigService,
  ) {
    super(config, service);
  }

  @Post('/')
  @HttpCode(OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  public async upload(
    @UploadedFile() uploaded: Record<string, any>,
    @CurrentUser() user: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const value = await this.service.upload({
        ...uploaded,
        user,
      });
      const response = await this.service.getResponse({
        code: OK,
        value,
        queryParser,
        message: this.lang.get(this.service.modelName).created,
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Get('/')
  @HttpCode(OK)
  @UseGuards(JwtAuthGuard)
  public async find(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    super.find(req, res, next);
  }
}

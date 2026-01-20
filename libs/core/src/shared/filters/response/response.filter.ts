import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR } from '../../constants';
import { AppException } from '../../exceptions';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const _meta: Record<any, any> = {};
    let code = INTERNAL_SERVER_ERROR;
    if (
      exception instanceof AppException ||
      exception instanceof HttpException
    ) {
      code = exception.getStatus();
      _meta.statusCode = exception.getStatus();
      _meta.error = exception.getResponse();
    } else if (exception instanceof Error) {
      code = INTERNAL_SERVER_ERROR;
      _meta.error = { code, message: exception.message };
      _meta.developer_message = exception;
    } else {
      code = INTERNAL_SERVER_ERROR;
      _meta.statusCode = code;
      _meta.error = {
        code,
        message: 'A problem with our server, please try again later',
      };
      _meta.developer_message = exception;
    }
    response.status(code).send({ meta: _meta });
  }
}

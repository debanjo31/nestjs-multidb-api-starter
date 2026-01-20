import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppException, UNAUTHORIZED } from '@shared/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/v1/ping' && req.method === 'GET') {
      return next();
    }
    const apiKey = req.query.api_key || req.headers['x-api-key'];
    if (!apiKey) {
      return next(new AppException(UNAUTHORIZED, 'Api key absent'));
    }
    if (apiKey === this.config.get('app.apiKey')) {
      return next();
    }
    return next();
  }
}

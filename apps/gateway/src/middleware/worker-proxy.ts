import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import httpProxy from 'express-http-proxy';
import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';
@Injectable()
export class WorkerProxyMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}

  private proxy(options: Options): RequestHandler {
    return createProxyMiddleware(options);
  }

  WorkerServiceProxy = (hostUrl) =>
    httpProxy(hostUrl, {
      proxyReqPathResolver: function (req) {
        Logger.log(`req.url:::${hostUrl}`);
        return `${req.baseUrl}${req.url}`;
      },
    });
  use(req: Request, res: Response, next: () => void) {
    this.WorkerServiceProxy(this.config.get('microservices.workerService.url'))(req, res, next);
  }
}

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import httpProxy from 'express-http-proxy';

@Injectable()
export class AdminProxyMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}
  AdminServiceProxy = (hostUrl) =>
    httpProxy(hostUrl, {
      proxyReqPathResolver: function (req) {
        Logger.log(`req.url:::${hostUrl}`);
        return `${req.baseUrl}${req.url}`;
      },
    });
  use(req: any, res: any, next: (error?: any) => void) {
    this.AdminServiceProxy(this.config.get('microservices.adminService.url'))(req, res, next);
  }
}

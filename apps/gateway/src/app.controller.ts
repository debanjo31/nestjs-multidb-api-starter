import { Controller, Get, HttpCode, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicJob, JobService, OK, QueueTasks } from '@shared/core';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly jobService: JobService) {}

  @Get('/health')
  @SkipThrottle()
  @HttpCode(OK)
  public health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gateway',
    };
  }

  @Get('/ping-worker')
  @HttpCode(OK)
  public async ping(@Req() req: Request, @Res() res: Response) {
    const job = new BasicJob();
    this.jobService.addJobToQueue(QueueTasks.PING, job);
    return res.status(OK).json(job);
  }
}

import { RequestMethod } from '@nestjs/common';

export const WorkerService = [{ path: '/media{/*path}', method: RequestMethod.ALL }];

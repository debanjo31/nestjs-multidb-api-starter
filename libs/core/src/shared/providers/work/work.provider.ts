import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { WorkerQueue } from '../../enum';

export const WORKER_PROVIDERS = [
  {
    provide: 'WORKER_SERVICE_TOKEN',
    useFactory: (config: ConfigService) => {
      Logger.log(`Rabbit MQ URL:::${config.get('app.rabbitMQ')}`);
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [config.get('app.rabbitMQ')],
          queue: WorkerQueue.PROCESS_WORK,
          queueOptions: { durable: true },
        },
      });
    },
    inject: [ConfigService],
  },
];

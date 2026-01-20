import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import {
  ResponseFilter,
  WorkerExceptionFilter,
  WorkerQueue,
} from '@shared/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = app.get(ConfigService);

  app.use(morgan('tiny'));
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new WorkerExceptionFilter());
  app.useGlobalFilters(new ResponseFilter());
  app.useGlobalPipes(new ValidationPipe());

  const rabbitUrl = config.get('app.rabbitMQ');
  Logger.log(`Rabbit MQ server connected:::${rabbitUrl}`);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: WorkerQueue.PROCESS_WORK,
      queueOptions: { durable: true },
      noAck: true,
    },
  });
  const port = config.get<number>('app.port') ?? 7010;
  await app.listen(port, () =>
    Logger.log(`WorkerService is listening on port ${port}`),
  );

  await app.startAllMicroservices();
}

bootstrap();

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ResponseFilter } from '@shared/core';
import morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
  });

  const config = app.get(ConfigService);

  app.use(morgan('tiny'));
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ResponseFilter());
  await app.startAllMicroservices();

  const port = config.get<number>('app.port') ?? 7004;
  await app.listen(port, () =>
    Logger.log('Gateway Service Running 👍 on PORT....' + port),
  );
}

bootstrap();

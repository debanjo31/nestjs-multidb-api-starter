import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { ResponseFilter, ValidationPipe } from '@shared/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });

  app.use(morgan('tiny'));
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new ResponseFilter());
  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('apiStarter API - Admin Service')
    .setDescription(
      'API documentation for the apiStarter Admin Service - handles admin authentication and user management',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Admin JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = config.get<number>('app.port') ?? 7001;
  await app.listen(port, () => {
    Logger.log(`Admin service is listening on port ${port}`);
    Logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  });
}

bootstrap();

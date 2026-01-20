import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MongooseHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Connection } from 'mongoose';

@ApiTags('App')
@Controller('/')
export class AppController {
  constructor(
    private health: HealthCheckService,
    private mongoService: MongooseHealthIndicator,
    private typeOrmService: TypeOrmHealthIndicator,
    private config: ConfigService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  @Get('/ping')
  @HealthCheck()
  checkService() {
    return this.health.check([
      () =>
        Promise.resolve<HealthIndicatorResult>({
          api: {
            status: 'up',
            environment: this.config.get('app.environment'),
          },
        }),
      () =>
        this.mongoService.pingCheck('mongoDB', {
          connection: this.connection,
        }),
      () => this.typeOrmService.pingCheck('postgres-db'),
    ]);
  }
}

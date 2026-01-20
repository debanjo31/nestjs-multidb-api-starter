import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { QueueTasks, Job, AppException, AppStatus } from '@shared/core';

@Injectable()
export class JobService {
  constructor(
    @Inject('WORKER_SERVICE_TOKEN')
    private readonly client: ClientProxy
  ) {}

  public addJobToQueue(task: QueueTasks, job: Job) {
    Logger.log(`Sent Job:::${job.queueName} Task:${task}`);
    this.client.send(task, job).subscribe({
      next: (res) => {
        Logger.log(
          `Finished:::${job.queueName}, Task:${task} in ${res.duration}`
        );
      },
      error: (err) => {
        Logger.error(
          new AppException(HttpStatus.INTERNAL_SERVER_ERROR, err, [
            `App error code ${AppStatus.WORKER_ERROR}`,
          ])
        );
      },
    });
  }
}

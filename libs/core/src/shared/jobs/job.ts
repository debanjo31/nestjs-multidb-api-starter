import { Utils, WorkerQueue } from '@shared/core';

export class Job {
  public queueName: string;
  public id: string;
  public data?: any;

  public constructor(queueName: WorkerQueue, data?: any) {
    this.queueName = queueName;
    this.data = data;
    this.id = Utils.generateUniqueId('job');
  }
}

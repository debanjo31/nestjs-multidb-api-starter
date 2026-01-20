import { WorkerQueue } from '@shared/core';
import { Job } from './job';

export class SmsJob extends Job {
  public from: string;
  public to: string;
  public template: string;
  public content: any;

  constructor() {
    super(WorkerQueue.PROCESS_WORK);
  }

  public setFrom(value: string) {
    this.from = value;
    return this;
  }

  public setTo(value: string) {
    this.to = value;
    return this;
  }

  public setTemplate(value: string) {
    this.template = value;
    return this;
  }

  public setContent(value: string) {
    this.content = value;
    return this;
  }
}

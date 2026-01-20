import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailJob,
  IEmailName,
  MailOption,
  QueueTasks,
} from '@shared/core/shared';
import { JobService } from '../job';

@Injectable()
export class WorkService {
  constructor(
    private readonly config: ConfigService,
    private readonly jobService: JobService
  ) {}

  queueToSendEmail(option: MailOption) {
    this.handleEmail(
      option.emailName,
      option.fromEmail,
      option.subject,
      option.template,
      option.content
    );
  }

  handleEmail(
    emailName: IEmailName,
    fromEmail: IEmailName,
    subject: string,
    template: string,
    additionalContent: any = {}
  ) {
    const emailJob = new EmailJob()
      .setFrom(fromEmail)
      .setTo(emailName)
      .setSubject(subject)
      .setTemplate(template)
      .setContent(additionalContent);
    this.jobService.addJobToQueue(QueueTasks.SEND_EMAIL, emailJob);
  }
}

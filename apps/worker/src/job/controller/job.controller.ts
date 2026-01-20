import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { EmailJob, QueueTasks } from '@shared/core';
import { EmailService } from '../services/email/email.service';

@Controller()
export class JobController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(QueueTasks.PING)
  public async ping(payload: Record<string, any>) {
    Logger.log(`Ping:::${JSON.stringify(payload)}`);
  }

  @EventPattern(QueueTasks.SEND_EMAIL)
  public async sendEmail(emailJob: EmailJob) {
    Logger.log(`Received email Job:::${emailJob.queueName}`);

    await this.emailService.sendEmail(emailJob);
    const payload = {
      queueTask: QueueTasks.SEND_EMAIL,
      body: {
        jobId: emailJob.id,
        subject: emailJob.subject,
        receiver: Array.isArray(emailJob.to)
          ? emailJob.to.map((t) => t.email)
          : emailJob.to.email,
      },
    };
    Logger.log(`Email Job Payload:::${payload}`);
  }
}

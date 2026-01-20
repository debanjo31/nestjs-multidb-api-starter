import { BankingModule } from '@banking/banking';
import { Module } from '@nestjs/common';
import { JobController } from './controller/job.controller';
import { EmailService } from './services/email/email.service';
import { JobService } from './services/job.service';

@Module({
  imports: [BankingModule],
  controllers: [JobController],
  providers: [EmailService, JobService],
  exports: [],
})
export class JobModule {}

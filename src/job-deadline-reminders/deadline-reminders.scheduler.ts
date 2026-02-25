import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobDeadlineReminder } from './job-deadline-reminder.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DeadlineRemindersScheduler {
  constructor(
    @InjectRepository(JobDeadlineReminder)
    private readonly reminderRepository: Repository<JobDeadlineReminder>,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Cron('0 9 * * *')
  async sendDeadlineReminders(): Promise<void> {
    const now = new Date();
    const reminders = await this.reminderRepository.find({
      relations: ['job', 'user'],
    });
    const toSend: JobDeadlineReminder[] = [];
    for (const r of reminders) {
      const job = r.job as { applicationDeadline?: Date };
      if (!job?.applicationDeadline) continue;
      const deadline = new Date(job.applicationDeadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (daysLeft === r.daysBefore) {
        toSend.push(r);
      }
    }
    for (const r of toSend) {
      try {
        const user = await this.usersService.findById(r.userId);
        const job = r.job as { title?: string; companyName?: string };
        const subject = `Ikoraniro: Application deadline in ${r.daysBefore} day(s) - ${job.title}`;
        const html = `<p>Hi,</p><p>The job "<strong>${job.title}</strong>" at ${job.companyName || 'Company'} has an application deadline in ${r.daysBefore} day(s).</p><p>Apply before it closes!</p>`;
        await this.mailService.sendMail(user.email, subject, html);
        await this.reminderRepository.remove(r);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Deadline reminder error', r.jobId, err);
      }
    }
  }
}

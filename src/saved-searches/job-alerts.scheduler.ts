import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from './saved-search.entity';
import { SavedSearchesService } from './saved-searches.service';
import { JobsService } from '../jobs/jobs.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class JobAlertsScheduler {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepository: Repository<SavedSearch>,
    private readonly savedSearchesService: SavedSearchesService,
    private readonly jobsService: JobsService,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 8 * * *')
  async runJobAlerts(): Promise<void> {
    const searches = await this.savedSearchRepository.find({
      where: { emailAlert: true },
      relations: ['user'],
    });
    for (const search of searches) {
      try {
        const user = search.user as { id: string; email: string };
        if (!user?.email) continue;
        const criteria = (search.criteria || {}) as {
          search?: string;
          jobType?: string;
          location?: string;
        };
        const { items } = await this.jobsService.findPublished({
          ...criteria,
          limit: 20,
          offset: 0,
        });
        const since = search.lastAlertedAt
          ? new Date(search.lastAlertedAt)
          : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newJobs = items.filter((j) => new Date(j.createdAt) > since);
        if (newJobs.length === 0) continue;
        const subject = `Ikoraniro: ${newJobs.length} new job(s) matching "${search.name}"`;
        const list = newJobs
          .map(
            (j) =>
              `- ${j.title} at ${j.companyName || 'Company'} (${j.location || 'Remote'})`,
          )
          .join('\n');
        const html = `<p>Hi,</p><p>${newJobs.length} new job(s) match your saved search "${search.name}":</p><pre>${list}</pre><p>Log in to apply.</p>`;
        await this.mailService.sendMail(user.email, subject, html);
        search.lastAlertedAt = new Date();
        await this.savedSearchRepository.save(search);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Job alert error for search', search.id, err);
      }
    }
  }
}

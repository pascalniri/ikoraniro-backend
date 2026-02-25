import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from './saved-job.entity';
import { JobsService } from '../jobs/jobs.service';
import { JobStatus } from '../jobs/job.entity';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectRepository(SavedJob)
    private readonly savedJobRepository: Repository<SavedJob>,
    private readonly jobsService: JobsService,
  ) {}

  async save(userId: string, jobId: string): Promise<SavedJob> {
    await this.jobsService.findOnePublished(jobId);

    const existing = await this.savedJobRepository.findOne({
      where: { userId, jobId },
    });
    if (existing) {
      throw new ConflictException('Job already saved');
    }

    const saved = this.savedJobRepository.create({ userId, jobId });
    return this.savedJobRepository.save(saved);
  }

  async unsave(userId: string, jobId: string): Promise<void> {
    const result = await this.savedJobRepository.delete({ userId, jobId });
    if (result.affected === 0) {
      throw new NotFoundException('Saved job not found');
    }
  }

  async findMySavedJobs(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ items: SavedJob[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const qb = this.savedJobRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.job', 'job')
      .where('s.userId = :userId', { userId })
      .andWhere('job.status = :status', { status: JobStatus.PUBLISHED });

    const [items, total] = await qb
      .orderBy('s.savedAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total };
  }

  /** Job IDs the user has saved (for applicant context on job list/detail). */
  async getSavedJobIds(userId: string): Promise<string[]> {
    const rows = await this.savedJobRepository
      .createQueryBuilder('s')
      .select('s.jobId')
      .where('s.userId = :userId', { userId })
      .getRawMany<{ jobId: string }>();
    return rows.map((r) => r.jobId);
  }
}

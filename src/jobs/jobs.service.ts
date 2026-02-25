import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /** List only published jobs (for talent browsing). Optional search and filters. */
  async findPublished(options: {
    search?: string;
    jobType?: string;
    location?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ items: Job[]; total: number }> {
    const { search, jobType, location, limit = 20, offset = 0 } = options;

    const qb = this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('(job.applicationDeadline IS NULL OR job.applicationDeadline > :now)', {
        now: new Date(),
      });

    if (search?.trim()) {
      qb.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search OR job.companyName ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }
    if (jobType) {
      qb.andWhere('job.jobType = :jobType', { jobType });
    }
    if (location?.trim()) {
      qb.andWhere('job.location ILIKE :location', { location: `%${location.trim()}%` });
    }

    const [items, total] = await qb
      .orderBy('job.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  /** Get one job if it is published (for public/talent view). */
  async findOnePublished(id: string): Promise<Job> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job not found');
    }
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new NotFoundException('Job has expired');
    }
    return job;
  }

  /**
   * Recommended jobs for an applicant: published jobs excluding already applied,
   * optionally biased by location (profile city/country). Order by newest first.
   */
  async findRecommendedForUser(
    appliedJobIds: string[],
    limit: number,
    locationHint?: { city?: string; country?: string },
  ): Promise<Job[]> {
    const qb = this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('(job.applicationDeadline IS NULL OR job.applicationDeadline > :now)', {
        now: new Date(),
      });

    if (appliedJobIds.length > 0) {
      qb.andWhere('job.id NOT IN (:...ids)', { ids: appliedJobIds });
    }

    if (locationHint?.city?.trim() || locationHint?.country?.trim()) {
      const loc = [locationHint.city, locationHint.country].filter(Boolean).join(' ');
      if (loc) {
        qb.andWhere('job.location ILIKE :loc', { loc: `%${loc}%` });
      }
    }

    return qb
      .orderBy('job.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}

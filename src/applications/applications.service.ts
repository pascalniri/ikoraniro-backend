import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { ApplicationStatusHistory } from './application-status-history.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JobsService } from '../jobs/jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(ApplicationStatusHistory)
    private readonly historyRepository: Repository<ApplicationStatusHistory>,
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly jobsService: JobsService,
  ) {}

  async apply(
    jobId: string,
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<Application> {
    const user = await this.usersService.findById(userId);
    const profile = await this.profilesService.getOrCreateForUser(user);
    const completeness = this.profilesService.completenessPercent(
      profile,
      user,
    );
    if (completeness < 50) {
      throw new ForbiddenException(
        'Profile must be at least 50% complete to apply. Complete your profile first.',
      );
    }

    const job = await this.jobsService.findOnePublished(jobId);

    const existing = await this.applicationRepository.findOne({
      where: { job: { id: jobId }, user: { id: userId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const resumeUrl = dto.resumeUrl ?? profile.resumeUrl;
    if (!resumeUrl) {
      throw new ForbiddenException(
        'Resume is required. Add a resume to your profile or upload one.',
      );
    }

    const application = this.applicationRepository.create({
      job,
      user,
      status: ApplicationStatus.SUBMITTED,
      answers: dto.answers,
      resumeUrl,
      coverLetterUrl: dto.coverLetterUrl,
    });
    const saved = await this.applicationRepository.save(application);
    await this.recordStatusChange(saved.id, null, ApplicationStatus.SUBMITTED);
    return saved;
  }

  async recordStatusChange(
    applicationId: string,
    fromStatus: ApplicationStatus | null,
    toStatus: ApplicationStatus,
    reason?: string,
    changedByUserId?: string,
  ): Promise<ApplicationStatusHistory> {
    const entry = this.historyRepository.create({
      application: { id: applicationId },
      fromStatus,
      toStatus,
      reason,
      changedBy: changedByUserId ? { id: changedByUserId } : undefined,
    });
    return this.historyRepository.save(entry);
  }

  async findMyApplications(
    userId: string,
    options: {
      status?: ApplicationStatus;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ items: Application[]; total: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const qb = this.applicationRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.job', 'job')
      .where('a.userId = :userId', { userId });

    if (status) {
      qb.andWhere('a.status = :status', { status });
    }

    const [items, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total };
  }

  async findOneForApplicant(
    applicationId: string,
    userId: string,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, user: { id: userId } },
      relations: ['job'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async withdraw(applicationId: string, userId: string): Promise<Application> {
    const application = await this.findOneForApplicant(applicationId, userId);
    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new ForbiddenException('Application is already withdrawn');
    }
    if (application.status === ApplicationStatus.OFFER_ACCEPTED) {
      throw new ForbiddenException('Cannot withdraw after accepting an offer');
    }
    const previousStatus = application.status;
    application.status = ApplicationStatus.WITHDRAWN;
    const saved = await this.applicationRepository.save(application);
    await this.recordStatusChange(
      applicationId,
      previousStatus,
      ApplicationStatus.WITHDRAWN,
      undefined,
      userId,
    );
    return saved;
  }

  async getHistoryForApplicant(
    applicationId: string,
    userId: string,
  ): Promise<ApplicationStatusHistory[]> {
    await this.findOneForApplicant(applicationId, userId);
    return this.historyRepository.find({
      where: { application: { id: applicationId } },
      order: { createdAt: 'ASC' },
      relations: ['changedBy'],
    });
  }

  async getCanApply(
    jobId: string,
    userId: string,
  ): Promise<{ canApply: boolean; reason?: string }> {
    try {
      await this.jobsService.findOnePublished(jobId);
    } catch {
      return {
        canApply: false,
        reason: 'Job not found or no longer accepting applications',
      };
    }
    const existing = await this.applicationRepository.findOne({
      where: { job: { id: jobId }, user: { id: userId } },
    });
    if (existing) {
      return {
        canApply: false,
        reason: 'You have already applied to this job',
      };
    }
    const user = await this.usersService.findById(userId);
    const profile = await this.profilesService.getOrCreateForUser(user);
    const completeness = this.profilesService.completenessPercent(
      profile,
      user,
    );
    if (completeness < 50) {
      return {
        canApply: false,
        reason:
          'Profile must be at least 50% complete to apply. Complete your profile first.',
      };
    }
    const resumeUrl = profile.resumeUrl;
    if (!resumeUrl) {
      return {
        canApply: false,
        reason:
          'Resume is required. Add a resume to your profile or upload one.',
      };
    }
    return { canApply: true };
  }

  /** Job IDs the user has applied to (for applicant context on job list/detail). */
  async getAppliedJobIds(userId: string): Promise<string[]> {
    const rows = await this.applicationRepository
      .createQueryBuilder('a')
      .select('a.jobId')
      .where('a.userId = :userId', { userId })
      .getRawMany<{ jobId: string }>();
    return rows.map((r) => r.jobId);
  }

  // Employer methods

  async findByJobForEmployer(
    jobId: string,
    employerId: string,
    options: {
      status?: ApplicationStatus;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ items: Application[]; total: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const job = await this.jobsService.findOne(jobId);
    // TODO: Verify employer ownership of the job
    // if (job.organizationId !== employerOrgId) throw Forbidden

    const qb = this.applicationRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .where('a.jobId = :jobId', { jobId });

    if (status) {
      qb.andWhere('a.status = :status', { status });
    }

    const [items, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { items, total };
  }

  async updateStatusByEmployer(
    applicationId: string,
    status: ApplicationStatus,
    employerId: string,
    reason?: string,
  ): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // TODO: Verify employer ownership of the job

    const fromStatus = application.status;
    application.status = status;
    const saved = await this.applicationRepository.save(application);

    await this.recordStatusChange(
      applicationId,
      fromStatus,
      status,
      reason,
      employerId,
    );

    return saved;
  }
}

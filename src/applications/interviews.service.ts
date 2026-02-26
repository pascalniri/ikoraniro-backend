import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewStatus } from './interview.entity';
import { Application } from './application.entity';
import { ScheduleInterviewDto, UpdateInterviewDto } from './dto/interview.dto';
import { User } from '../users/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrganizationRole } from '../organizations/organization-member.entity';
import { AuditLogsService } from '../organizations/audit-logs.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly organizationsService: OrganizationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async schedule(
    dto: ScheduleInterviewDto,
    interviewer: User,
  ): Promise<Interview> {
    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.job;
    if (!job.organizationId) {
      throw new ForbiddenException(
        'This job is not associated with an organization',
      );
    }

    const isMember = await this.organizationsService.hasRole(
      interviewer.id,
      job.organizationId,
      [
        OrganizationRole.OWNER,
        OrganizationRole.ADMIN,
        OrganizationRole.RECRUITER,
        OrganizationRole.INTERVIEWER,
      ],
    );
    if (!isMember) {
      throw new ForbiddenException(
        'You do not have permission to schedule interviews for this job',
      );
    }

    const interview = this.interviewRepository.create({
      application,
      stage: dto.stage,
      scheduledAt: new Date(dto.scheduledAt),
      location: dto.location,
      interviewerNotes: dto.interviewerNotes,
      status: InterviewStatus.PENDING,
      interviewer,
    });

    const saved = await this.interviewRepository.save(interview);

    await this.auditLogsService.log(
      job.organizationId,
      interviewer.id,
      'INTERVIEW_SCHEDULED',
      {
        applicationId: application.id,
        stage: dto.stage,
        scheduledAt: dto.scheduledAt,
      },
    );

    return saved;
  }

  async update(id: string, dto: UpdateInterviewDto): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['application'],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (dto.status) interview.status = dto.status;
    if (dto.scheduledAt) interview.scheduledAt = new Date(dto.scheduledAt);
    if (dto.location) interview.location = dto.location;
    if (dto.interviewerNotes) interview.interviewerNotes = dto.interviewerNotes;
    if (dto.candidateFeedback)
      interview.candidateFeedback = dto.candidateFeedback;

    return this.interviewRepository.save(interview);
  }

  async findByApplication(applicationId: string): Promise<Interview[]> {
    return this.interviewRepository.find({
      where: { application: { id: applicationId } },
      relations: ['interviewer'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['application', 'interviewer', 'application.job'],
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }
}

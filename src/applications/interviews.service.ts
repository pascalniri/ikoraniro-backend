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

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
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

    // TODO: Verify that the interviewer (user) has permission to manage this job
    // For now, we allow if they are an interviewer. In a real app, check job.organizationId

    const interview = this.interviewRepository.create({
      application,
      stage: dto.stage,
      scheduledAt: new Date(dto.scheduledAt),
      location: dto.location,
      interviewerNotes: dto.interviewerNotes,
      status: InterviewStatus.PENDING,
      interviewer,
    });

    return this.interviewRepository.save(interview);
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

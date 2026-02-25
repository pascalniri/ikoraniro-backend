import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobDeadlineReminder } from './job-deadline-reminder.entity';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class JobDeadlineRemindersService {
  constructor(
    @InjectRepository(JobDeadlineReminder)
    private readonly reminderRepository: Repository<JobDeadlineReminder>,
    private readonly jobsService: JobsService,
  ) {}

  async create(userId: string, jobId: string, daysBefore: number): Promise<JobDeadlineReminder> {
    if (daysBefore < 1 || daysBefore > 30) {
      throw new BadRequestException('daysBefore must be between 1 and 30');
    }
    await this.jobsService.findOnePublished(jobId);
    const existing = await this.reminderRepository.findOne({
      where: { userId, jobId },
    });
    if (existing) {
      throw new ConflictException('Reminder already set for this job');
    }
    const reminder = this.reminderRepository.create({
      userId,
      jobId,
      daysBefore,
    });
    return this.reminderRepository.save(reminder);
  }

  async findAllByUserId(userId: string): Promise<JobDeadlineReminder[]> {
    return this.reminderRepository.find({
      where: { userId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: string, jobId: string): Promise<void> {
    const result = await this.reminderRepository.delete({ userId, jobId });
    if (result.affected === 0) {
      throw new NotFoundException('Reminder not found');
    }
  }
}

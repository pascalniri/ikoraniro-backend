import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobDeadlineRemindersService } from './job-deadline-reminders.service';

@Controller('job-deadline-reminders')
@UseGuards(JwtAuthGuard)
export class JobDeadlineRemindersController {
  constructor(
    private readonly jobDeadlineRemindersService: JobDeadlineRemindersService,
  ) {}

  @Post('jobs/:jobId')
  async create(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
    @Body('daysBefore') daysBefore: number,
  ) {
    return this.jobDeadlineRemindersService.create(
      req.user.userId,
      jobId,
      daysBefore ?? 3,
    );
  }

  @Get()
  async list(@Req() req: { user: { userId: string } }) {
    return this.jobDeadlineRemindersService.findAllByUserId(req.user.userId);
  }

  @Delete('jobs/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
  ) {
    await this.jobDeadlineRemindersService.remove(req.user.userId, jobId);
  }
}

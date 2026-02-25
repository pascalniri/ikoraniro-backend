import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobDeadlineReminder } from './job-deadline-reminder.entity';
import { JobDeadlineRemindersService } from './job-deadline-reminders.service';
import { JobDeadlineRemindersController } from './job-deadline-reminders.controller';
import { DeadlineRemindersScheduler } from './deadline-reminders.scheduler';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobDeadlineReminder]),
    JobsModule,
    UsersModule,
  ],
  providers: [JobDeadlineRemindersService, DeadlineRemindersScheduler],
  controllers: [JobDeadlineRemindersController],
  exports: [JobDeadlineRemindersService],
})
export class JobDeadlineRemindersModule {}

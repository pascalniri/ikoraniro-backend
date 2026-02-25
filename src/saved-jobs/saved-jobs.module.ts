import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJob } from './saved-job.entity';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedJob]), JobsModule],
  providers: [SavedJobsService],
  controllers: [SavedJobsController],
  exports: [SavedJobsService, TypeOrmModule],
})
export class SavedJobsModule {}

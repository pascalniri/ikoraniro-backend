import { Module } from '@nestjs/common';
import { ApplicantJobsController } from './applicant-jobs.controller';
import { JobsModule } from '../jobs/jobs.module';
import { ApplicationsModule } from '../applications/applications.module';
import { SavedJobsModule } from '../saved-jobs/saved-jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JobsModule,
    ApplicationsModule,
    SavedJobsModule,
    ProfilesModule,
    UsersModule,
  ],
  controllers: [ApplicantJobsController],
})
export class ApplicantModule {}

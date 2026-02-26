import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { ApplicationStatusHistory } from './application-status-history.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { JobsModule } from '../jobs/jobs.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import { Interview } from './interview.entity';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationStatusHistory,
      Interview,
    ]),
    JobsModule,
    ProfilesModule,
    UsersModule,
    OrganizationsModule,
  ],
  providers: [ApplicationsService, InterviewsService],
  controllers: [ApplicationsController, InterviewsController],
  exports: [ApplicationsService, InterviewsService, TypeOrmModule],
})
export class ApplicationsModule {}

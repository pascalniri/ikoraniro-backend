import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { SavedJobsModule } from './saved-jobs/saved-jobs.module';
import { ApplicantModule } from './applicant/applicant.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { MailModule } from './mail/mail.module';
import { JobDeadlineRemindersModule } from './job-deadline-reminders/job-deadline-reminders.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    MailModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'ikoraniro',
        autoLoadEntities: true,
        synchronize: false,
        ssl:
          process.env.DATABASE_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    JobsModule,
    ApplicationsModule,
    SavedJobsModule,
    ApplicantModule,
    SavedSearchesModule,
    JobDeadlineRemindersModule,
    OrganizationsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

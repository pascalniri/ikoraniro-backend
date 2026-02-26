import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User, UserType, UserStatus } from '../users/user.entity';
import { Job, JobStatus, JobType } from '../jobs/job.entity';
import {
  Application,
  ApplicationStatus,
} from '../applications/application.entity';
import {
  Interview,
  InterviewStage,
  InterviewStatus,
} from '../applications/interview.entity';
import { ApplicationStatusHistory } from '../applications/application-status-history.entity';
import { RefreshToken } from '../auth/refresh-token.entity';
import { Profile } from '../profiles/profile.entity';
import { SavedSearch } from '../saved-searches/saved-search.entity';
import { JobDeadlineReminder } from '../job-deadline-reminders/job-deadline-reminder.entity';
import { SavedJob } from '../saved-jobs/saved-job.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'neondb_owner',
  password: process.env.DATABASE_PASSWORD || 'npg_GCEnoSkx04iW',
  database: process.env.DATABASE_NAME || 'neondb',
  entities: [
    User,
    Job,
    Application,
    Interview,
    ApplicationStatusHistory,
    RefreshToken,
    Profile,
    SavedSearch,
    JobDeadlineReminder,
    SavedJob,
  ],
  synchronize: false,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  console.log('🌱 Seeding database...');
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const jobRepository = dataSource.getRepository(Job);
  const applicationRepository = dataSource.getRepository(Application);
  const interviewRepository = dataSource.getRepository(Interview);
  const statusHistoryRepository = dataSource.getRepository(
    ApplicationStatusHistory,
  );

  // 1. Optional: Clear existing data
  if (process.env.CLEAN_SEED === 'true') {
    console.log('🧹 Clearing existing data...');
    // Delete in order to avoid FK constraints
    await interviewRepository.createQueryBuilder().delete().execute();
    await statusHistoryRepository.createQueryBuilder().delete().execute();
    await applicationRepository.createQueryBuilder().delete().execute();
    await jobRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();
  }

  // 2. Check if already seeded
  const userCount = await userRepository.count();
  if (userCount > 0 && process.env.CLEAN_SEED !== 'true') {
    console.log(
      '⚠️ Database already contains users. Use CLEAN_SEED=true to override.',
    );
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const employer = userRepository.create({
    email: 'employer@ikoraniro.com',
    passwordHash,
    firstName: 'Ikoraniro',
    lastName: 'Admin',
    type: UserType.SOLO_EMPLOYER,
    status: UserStatus.ACTIVE,
  });

  const applicant = userRepository.create({
    email: 'applicant@ikoraniro.com',
    passwordHash,
    firstName: 'John',
    lastName: 'Doe',
    type: UserType.INDIVIDUAL,
    status: UserStatus.ACTIVE,
  });

  await userRepository.save([employer, applicant]);
  console.log('✅ Users seeded');

  // 2. Create Jobs
  const jobs = jobRepository.create([
    {
      title: 'Full Stack NestJS Developer',
      description:
        'Join our team to build amazing web applications for the African market.',
      requirements:
        '3+ years with NestJS, TypeORM, and PostgreSQL. Experience with Cloudinary is a plus.',
      location: 'Remote',
      jobType: JobType.FULL_TIME,
      status: JobStatus.PUBLISHED,
      companyName: 'Ikoraniro Tech',
      organizationId: 'org_123',
    },
    {
      title: 'UI/UX Designer',
      description:
        'Create beautiful user interfaces and user experiences for our recruitment platform.',
      requirements:
        'Proficiency in Figma and Adobe Creative Suite. Knowledge of accessibility standards.',
      location: 'Kigali, Rwanda',
      jobType: JobType.CONTRACT,
      status: JobStatus.PUBLISHED,
      companyName: 'Ikoraniro Design',
      organizationId: 'org_123',
    },
  ]);

  await jobRepository.save(jobs);
  console.log('✅ Jobs seeded');

  // 3. Create Applications
  const application = applicationRepository.create({
    user: applicant,
    job: jobs[0],
    status: ApplicationStatus.UNDER_REVIEW,
    answers: {
      experience: '5 years',
      motivation: 'I want to build impactful tech.',
    },
    resumeUrl:
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.pdf',
  });

  await applicationRepository.save(application);
  console.log('✅ Applications seeded');

  // 4. Create Interviews
  const interview = interviewRepository.create({
    application: application,
    stage: InterviewStage.TECHNICAL,
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    location: 'Google Meet',
    status: InterviewStatus.PENDING,
    interviewer: employer,
    interviewerNotes: 'Candidate has a strong background in NestJS.',
  });

  await interviewRepository.save(interview);
  console.log('✅ Interviews seeded');

  await dataSource.destroy();
  console.log('🏁 Seeding completed!');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

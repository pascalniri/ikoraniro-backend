import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from '../applications/application.entity';
import { SavedJob } from '../saved-jobs/saved-job.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ON_SITE = 'ON_SITE',
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ type: 'enum', enum: JobType })
  jobType: JobType;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: true })
  remoteOk: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ nullable: true })
  salaryMin?: number;

  @Column({ nullable: true })
  salaryMax?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ default: true })
  salaryVisible: boolean;

  @Column({ nullable: true })
  applicationDeadline?: Date;

  @Column({ nullable: true })
  companyName?: string;

  /** Optional org id when job is posted by an organization */
  @Column({ nullable: true })
  organizationId?: string;

  @Column({ type: 'jsonb', nullable: true })
  customQuestions?: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Application, (app) => app.job)
  applications: Application[];

  @OneToMany(() => SavedJob, (s) => s.job)
  savedBy: SavedJob[];
}

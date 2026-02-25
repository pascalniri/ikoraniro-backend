import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

@Entity()
@Unique(['userId', 'jobId'])
export class JobDeadlineReminder {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  jobId: string;

  @Column()
  daysBefore: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  job: Job;

  @CreateDateColumn()
  createdAt: Date;
}

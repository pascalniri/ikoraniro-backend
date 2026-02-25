import {
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
export class SavedJob {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  jobId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Job, (job) => job.savedBy, { onDelete: 'CASCADE' })
  job: Job;

  @CreateDateColumn()
  savedAt: Date;
}

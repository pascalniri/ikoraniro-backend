import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  /** Stored criteria: { search?, jobType?, location? } */
  @Column({ type: 'jsonb' })
  criteria: Record<string, unknown>;

  @Column({ default: false })
  emailAlert: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastAlertedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}

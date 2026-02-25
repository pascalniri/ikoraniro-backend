import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { User } from '../users/user.entity';

@Entity()
export class ApplicationStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  application: Application;

  @Column({ type: 'enum', enum: ApplicationStatus, nullable: true })
  fromStatus: ApplicationStatus | null;

  @Column({ type: 'enum', enum: ApplicationStatus })
  toStatus: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  changedBy?: User;

  @CreateDateColumn()
  createdAt: Date;
}

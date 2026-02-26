import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { User } from '../users/user.entity';

export enum InterviewStage {
  PHONE_SCREEN = 'PHONE_SCREEN',
  TECHNICAL = 'TECHNICAL',
  CULTURAL = 'CULTURAL',
  MANAGEMENT = 'MANAGEMENT',
  FINAL_ROUND = 'FINAL_ROUND',
  OTHER = 'OTHER',
}

export enum InterviewStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  application: Application;

  @Column({ type: 'enum', enum: InterviewStage })
  stage: InterviewStage;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ nullable: true })
  location?: string; // Meet link, Zoom or Office address

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.PENDING,
  })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  interviewerNotes?: string;

  @Column({ type: 'text', nullable: true })
  candidateFeedback?: string; // Optional feedback sent to candidate

  @ManyToOne(() => User)
  interviewer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  headline?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  profilePictureUrl?: string;

  /** Open to work: ACTIVELY_LOOKING | OPEN_TO_OPPORTUNITIES | NOT_LOOKING */
  @Column({ nullable: true })
  openToWork?: string;

  /** Who can see profile: PUBLIC | RECRUITERS_ONLY | HIDDEN */
  @Column({ default: 'PUBLIC' })
  profileVisibility: string;

  /** Show "Open to work" to recruiters/employers */
  @Column({ default: true })
  openToWorkVisible: boolean;

  /** JSON: { company, title, location, type, start, end, description }[] */
  @Column({ type: 'jsonb', nullable: true })
  workExperience?: Record<string, unknown>[];

  /** JSON: { institution, degree, field, start, end, grade }[] */
  @Column({ type: 'jsonb', nullable: true })
  education?: Record<string, unknown>[];

  /** JSON: { name, level, years }[] - level: BEGINNER | INTERMEDIATE | ADVANCED | EXPERT */
  @Column({ type: 'jsonb', nullable: true })
  skills?: Record<string, unknown>[];

  /** JSON: { name, proficiency }[] - proficiency: BASIC | CONVERSATIONAL | PROFESSIONAL | NATIVE */
  @Column({ type: 'jsonb', nullable: true })
  languages?: Record<string, unknown>[];

  @Column({ nullable: true })
  resumeUrl?: string;

  /** JSON: { label, url }[] e.g. LinkedIn, GitHub, website */
  @Column({ type: 'jsonb', nullable: true })
  portfolioLinks?: Record<string, unknown>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

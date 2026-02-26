import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from '../users/user.entity';

@Entity()
export class OrganizationAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Organization } from './organization.entity';

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  INTERVIEWER = 'INTERVIEWER',
}

@Entity()
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, (org) => org.members, { onDelete: 'CASCADE' })
  organization: Organization;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.RECRUITER,
  })
  role: OrganizationRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

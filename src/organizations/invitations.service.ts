import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrganizationInvitation,
  InvitationStatus,
} from './organization-invitation.entity';
import {
  OrganizationMember,
  OrganizationRole,
} from './organization-member.entity';
import { Organization } from './organization.entity';
import { User } from '../users/user.entity';
import * as crypto from 'crypto';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(OrganizationInvitation)
    private readonly invitationRepository: Repository<OrganizationInvitation>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    organization: Organization,
    email: string,
    role: OrganizationRole,
    invitedByUserId: string,
  ): Promise<OrganizationInvitation> {
    // Check if user is already a member
    const existingMember = await this.memberRepository.findOne({
      where: { organization: { id: organization.id }, user: { email } },
    });
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = this.invitationRepository.create({
      email,
      organization,
      role,
      token,
      expiresAt,
    });

    const saved = await this.invitationRepository.save(invitation);

    await this.auditLogsService.log(
      organization.id,
      invitedByUserId,
      'MEMBER_INVITED',
      { email, role },
    );

    return saved;
  }

  async accept(token: string, user: User): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { token, status: InvitationStatus.PENDING },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new ConflictException('Invitation has expired');
    }

    if (invitation.email !== user.email) {
      throw new ConflictException(
        'This invitation was sent to a different email address',
      );
    }

    // Add member
    const member = this.memberRepository.create({
      organization: invitation.organization,
      user,
      role: invitation.role,
    });
    await this.memberRepository.save(member);

    // Mark invitation as accepted
    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepository.save(invitation);

    await this.auditLogsService.log(
      invitation.organization.id,
      user.id,
      'INVITATION_ACCEPTED',
      { email: invitation.email },
    );
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { OrganizationMember } from './organization-member.entity';
import { OrganizationInvitation } from './organization-invitation.entity';
import { OrganizationAuditLog } from './organization-audit-log.entity';

import { OrganizationsService } from './organizations.service';
import { InvitationsService } from './invitations.service';
import { AuditLogsService } from './audit-logs.service';
import { OrganizationsController } from './organizations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationInvitation,
      OrganizationAuditLog,
    ]),
  ],
  providers: [OrganizationsService, InvitationsService, AuditLogsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService, AuditLogsService, TypeOrmModule],
})
export class OrganizationsModule {}

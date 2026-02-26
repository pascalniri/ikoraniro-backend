import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { InvitationsService } from './invitations.service';
import { CreateOrganizationDto, InviteMemberDto } from './dto/organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationRole } from './organization-member.entity';
import { AuditLogsService } from './audit-logs.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(
    private readonly orgService: OrganizationsService,
    private readonly invitationsService: InvitationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get(':id/activity')
  async getActivity(@Param('id') id: string, @Req() req: any) {
    // Only Owners and Admins can view activity
    const hasAccess = await this.orgService.hasRole(req.user.id, id, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);
    if (!hasAccess) {
      throw new Error('Forbidden: Only Owners or Admins can view activity');
    }
    return this.auditLogsService.findByOrganization(id);
  }

  @Post()
  async create(@Body() dto: CreateOrganizationDto, @Req() req: any) {
    return this.orgService.create(dto.name, req.user);
  }

  @Get('my')
  async getMyOrganizations(@Req() req: any) {
    return this.orgService.findByUser(req.user.id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Post(':id/invitations')
  async invite(
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
    @Req() req: any,
  ) {
    // Only Owners and Admins can invite
    const hasAccess = await this.orgService.hasRole(req.user.id, id, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);
    if (!hasAccess) {
      throw new Error('Forbidden: Only Owners or Admins can invite members');
    }

    const org = await this.orgService.findOne(id);
    return this.invitationsService.create(
      org,
      dto.email,
      dto.role,
      req.user.id,
    );
  }

  @Post('invitations/:token/accept')
  async acceptInvitation(@Param('token') token: string, @Req() req: any) {
    return this.invitationsService.accept(token, req.user);
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import {
  OrganizationMember,
  OrganizationRole,
} from './organization-member.entity';
import { User } from '../users/user.entity';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepository: Repository<OrganizationMember>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(name: string, owner: User): Promise<Organization> {
    const slug = name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    // Check if slug exists
    const existing = await this.orgRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Organization name or slug already in use');
    }

    const organization = this.orgRepository.create({ name, slug });
    await this.orgRepository.save(organization);

    const member = this.memberRepository.create({
      organization,
      user: owner,
      role: OrganizationRole.OWNER,
    });
    await this.memberRepository.save(member);

    await this.auditLogsService.log(
      organization.id,
      owner.id,
      'ORGANIZATION_CREATED',
      { organizationName: name },
    );

    return organization;
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findByUser(userId: string): Promise<OrganizationMember[]> {
    return this.memberRepository.find({
      where: { user: { id: userId } },
      relations: ['organization'],
    });
  }

  async isMember(userId: string, organizationId: string): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { user: { id: userId }, organization: { id: organizationId } },
    });
    return !!member;
  }

  async hasRole(
    userId: string,
    organizationId: string,
    roles: OrganizationRole[],
  ): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { user: { id: userId }, organization: { id: organizationId } },
    });
    return !!(member && roles.includes(member.role));
  }
}

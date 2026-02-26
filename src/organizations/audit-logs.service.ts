import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationAuditLog } from './organization-audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(OrganizationAuditLog)
    private readonly auditLogRepository: Repository<OrganizationAuditLog>,
  ) {}

  async log(
    organizationId: string,
    userId: string | null,
    action: string,
    details?: Record<string, any>,
  ): Promise<OrganizationAuditLog> {
    const log = this.auditLogRepository.create({
      organizationId,
      userId: userId || undefined,
      action,
      details,
    });
    return this.auditLogRepository.save(log);
  }

  async findByOrganization(
    organizationId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ items: OrganizationAuditLog[]; total: number }> {
    const [items, total] = await this.auditLogRepository.findAndCount({
      where: { organizationId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }
}

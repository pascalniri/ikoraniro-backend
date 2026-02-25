import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from './saved-search.entity';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepository: Repository<SavedSearch>,
    private readonly jobsService: JobsService,
  ) {}

  async create(userId: string, dto: CreateSavedSearchDto): Promise<SavedSearch> {
    const saved = this.savedSearchRepository.create({
      user: { id: userId },
      name: dto.name,
      criteria: dto.criteria ?? {},
      emailAlert: dto.emailAlert ?? false,
    });
    return this.savedSearchRepository.save(saved);
  }

  async findAllByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ items: SavedSearch[]; total: number }> {
    const { limit = 50, offset = 0 } = options;
    const qb = this.savedSearchRepository
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId })
      .orderBy('s.createdAt', 'DESC');

    const [items, total] = await qb
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    return { items, total };
  }

  async findOneForUser(id: string, userId: string): Promise<SavedSearch> {
    const one = await this.savedSearchRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!one) {
      throw new NotFoundException('Saved search not found');
    }
    return one;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    const saved = await this.findOneForUser(id, userId);
    if (dto.name !== undefined) saved.name = dto.name;
    if (dto.criteria !== undefined) saved.criteria = dto.criteria;
    if (dto.emailAlert !== undefined) saved.emailAlert = dto.emailAlert;
    return this.savedSearchRepository.save(saved);
  }

  async remove(id: string, userId: string): Promise<void> {
    const saved = await this.findOneForUser(id, userId);
    await this.savedSearchRepository.remove(saved);
  }

  /**
   * Run a saved search: apply its criteria to published jobs and return results.
   */
  async runSearch(
    id: string,
    userId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ items: unknown[]; total: number }> {
    const saved = await this.findOneForUser(id, userId);
    const criteria = (saved.criteria || {}) as {
      search?: string;
      jobType?: string;
      location?: string;
    };
    return this.jobsService.findPublished({
      search: criteria.search,
      jobType: criteria.jobType,
      location: criteria.location,
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
    });
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JobsService } from '../jobs/jobs.service';
import { ApplicationsService } from '../applications/applications.service';
import { SavedJobsService } from '../saved-jobs/saved-jobs.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';

@Controller('applicant')
@UseGuards(JwtAuthGuard)
export class ApplicantJobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly applicationsService: ApplicationsService,
    private readonly savedJobsService: SavedJobsService,
    private readonly profilesService: ProfilesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('jobs')
  async listJobs(
    @Req() req: { user: { userId: string } },
    @Query('search') search?: string,
    @Query('jobType') jobType?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const { items, total } = await this.jobsService.findPublished({
      search,
      jobType,
      location,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    const [appliedIds, savedIds] = await Promise.all([
      this.applicationsService.getAppliedJobIds(req.user.userId),
      this.savedJobsService.getSavedJobIds(req.user.userId),
    ]);
    const appliedSet = new Set(appliedIds);
    const savedSet = new Set(savedIds);
    return {
      items: items.map((job) => ({
        ...job,
        applied: appliedSet.has(job.id),
        saved: savedSet.has(job.id),
      })),
      total,
    };
  }

  @Get('jobs/recommended')
  async recommendedJobs(@Req() req: { user: { userId: string } }) {
    const limit = 15;
    const userId = req.user.userId;
    const [appliedIds, user] = await Promise.all([
      this.applicationsService.getAppliedJobIds(userId),
      this.usersService.findById(userId),
    ]);
    const profile = await this.profilesService.getOrCreateForUser(user);
    const recommended = await this.jobsService.findRecommendedForUser(
      appliedIds,
      limit,
      { city: profile.city ?? undefined, country: profile.country ?? undefined },
    );
    const savedIds = await this.savedJobsService.getSavedJobIds(userId);
    const appliedSet = new Set(appliedIds);
    const savedSet = new Set(savedIds);
    return {
      items: recommended.map((job) => ({
        ...job,
        applied: appliedSet.has(job.id),
        saved: savedSet.has(job.id),
      })),
    };
  }

  @Get('jobs/:id/can-apply')
  async canApply(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.applicationsService.getCanApply(id, req.user.userId);
  }

  @Get('jobs/:id')
  async getJob(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    const job = await this.jobsService.findOnePublished(id);
    const [appliedIds, savedIds] = await Promise.all([
      this.applicationsService.getAppliedJobIds(req.user.userId),
      this.savedJobsService.getSavedJobIds(req.user.userId),
    ]);
    return {
      ...job,
      applied: appliedIds.includes(job.id),
      saved: savedIds.includes(job.id),
    };
  }
}

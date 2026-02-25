import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedJobsService } from './saved-jobs.service';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Post('jobs/:jobId')
  async save(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.savedJobsService.save(req.user.userId, jobId);
  }

  @Delete('jobs/:jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsave(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
  ) {
    await this.savedJobsService.unsave(req.user.userId, jobId);
  }

  @Get()
  async list(
    @Req() req: { user: { userId: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.savedJobsService.findMySavedJobs(req.user.userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from './application.entity';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId/apply')
  async apply(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(jobId, req.user.userId, dto);
  }

  @Get()
  async getMyApplications(
    @Req() req: { user: { userId: string } },
    @Query('status') status?: ApplicationStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.applicationsService.findMyApplications(req.user.userId, {
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get(':id/history')
  async getHistory(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.applicationsService.getHistoryForApplicant(id, req.user.userId);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.applicationsService.findOneForApplicant(id, req.user.userId);
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.applicationsService.withdraw(id, req.user.userId);
  }

  // Employer Endpoints

  @Get('employer/jobs/:jobId')
  async getApplicantsForJob(
    @Param('jobId') jobId: string,
    @Req() req: { user: { userId: string } },
    @Query('status') status?: ApplicationStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.applicationsService.findByJobForEmployer(
      jobId,
      req.user.userId,
      {
        status,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      },
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
    @Body('status') status: ApplicationStatus,
    @Body('reason') reason?: string,
  ) {
    return this.applicationsService.updateStatusByEmployer(
      id,
      status,
      req.user.userId,
      reason,
    );
  }
}

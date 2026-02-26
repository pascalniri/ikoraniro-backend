import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { ScheduleInterviewDto, UpdateInterviewDto } from './dto/interview.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  async schedule(@Body() dto: ScheduleInterviewDto, @Req() req: { user: any }) {
    return this.interviewsService.schedule(dto, req.user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewsService.update(id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Get('application/:applicationId')
  async findByApplication(@Param('applicationId') applicationId: string) {
    return this.interviewsService.findByApplication(applicationId);
  }
}

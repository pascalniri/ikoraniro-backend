import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { InterviewStage, InterviewStatus } from '../interview.entity';

export class ScheduleInterviewDto {
  @IsUUID()
  @IsNotEmpty()
  applicationId: string;

  @IsEnum(InterviewStage)
  @IsNotEmpty()
  stage: InterviewStage;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  interviewerNotes?: string;
}

export class UpdateInterviewDto {
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  interviewerNotes?: string;

  @IsString()
  @IsOptional()
  candidateFeedback?: string;
}

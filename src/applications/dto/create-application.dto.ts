import { IsOptional, IsString, IsObject } from 'class-validator';

export class CreateApplicationDto {
  /** Answers to job's custom questions (keyed by question id or order) */
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  coverLetterUrl?: string;
}

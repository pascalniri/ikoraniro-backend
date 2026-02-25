import { IsOptional, IsString, IsArray, IsBoolean, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  openToWork?: string;

  @IsOptional()
  @IsString()
  profileVisibility?: string;

  @IsOptional()
  @IsBoolean()
  openToWorkVisible?: boolean;

  @IsOptional()
  @IsArray()
  workExperience?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  education?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  skills?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  languages?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsArray()
  portfolioLinks?: Record<string, unknown>[];
}

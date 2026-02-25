import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsObject()
  criteria: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  emailAlert?: boolean;
}

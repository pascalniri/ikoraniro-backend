import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { OrganizationRole } from '../organization-member.entity';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OrganizationRole)
  @IsNotEmpty()
  role: OrganizationRole;
}

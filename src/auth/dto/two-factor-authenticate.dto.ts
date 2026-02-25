import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthenticateDto {
  @ApiProperty({ example: 'uuid-v4-here', description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  code: string;
}

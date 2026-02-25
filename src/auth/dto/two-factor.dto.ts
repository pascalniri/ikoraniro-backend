import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorDto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  code: string;
}

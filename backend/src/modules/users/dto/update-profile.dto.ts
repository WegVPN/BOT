import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'NewNickname' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ example: 'My awesome signature' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  signature?: string;
}

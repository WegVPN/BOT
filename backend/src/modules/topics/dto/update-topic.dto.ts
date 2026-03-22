import { IsString, IsBoolean, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTopicDto {
  @ApiPropertyOptional({ example: 'Updated topic title' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  title?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_pinned?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_closed?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  forum_id?: number;
}

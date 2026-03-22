import { IsString, IsOptional, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateForumDto {
  @ApiProperty({ example: 'General Discussion' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'Talk about anything here' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Be respectful and follow the rules' })
  @IsString()
  @IsOptional()
  rules?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  category_id: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_visible?: boolean;
}

import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated content here...' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  content?: string;
}

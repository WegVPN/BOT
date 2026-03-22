import { IsString, IsNotEmpty, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  topic_id: number;

  @ApiProperty({ example: 'This is my reply to the topic...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  content: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  parent_post_id?: number;
}

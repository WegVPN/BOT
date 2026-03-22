import { IsString, IsNotEmpty, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ example: 'My new topic title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  forum_id: number;

  @ApiProperty({ example: 'This is the content of my first post...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
}

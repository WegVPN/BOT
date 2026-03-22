import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { Forum } from '../../entities/forum.entity';
import { Category } from '../../entities/category.entity';
import { Topic } from '../../entities/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, Category, Topic])],
  controllers: [ForumsController],
  providers: [ForumsService],
  exports: [ForumsService],
})
export class ForumsModule {}

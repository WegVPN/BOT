import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '../../entities/post.entity';
import { Topic } from '../../entities/topic.entity';
import { User } from '../../entities/user.entity';
import { Forum } from '../../entities/forum.entity';
import { Attachment } from '../../entities/attachment.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Topic, User, Forum, Attachment]),
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}

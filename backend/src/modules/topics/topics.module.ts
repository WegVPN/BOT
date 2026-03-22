import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { Topic } from '../../entities/topic.entity';
import { Forum } from '../../entities/forum.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, Forum, Post, User, UserSubscription]),
    NotificationsModule,
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}

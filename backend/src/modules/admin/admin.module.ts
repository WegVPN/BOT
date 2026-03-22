import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Forum } from '../../entities/forum.entity';
import { Topic } from '../../entities/topic.entity';
import { Post } from '../../entities/post.entity';
import { ModerationLog } from '../../entities/moderation-log.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Forum, Topic, Post, ModerationLog]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

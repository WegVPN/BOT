import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { Post } from '../../entities/post.entity';
import { Topic } from '../../entities/topic.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: number,
    type: NotificationType,
    data: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user_id: userId,
      type,
      data,
    });
    return this.notificationsRepository.save(notification);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { user_id: userId, read: false },
    });
  }

  async getAll(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { notifications, total };
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    await this.notificationsRepository.update(
      { id: notificationId, user_id: userId },
      { read: true },
    );
    return this.notificationsRepository.findOne({ where: { id: notificationId } });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, read: false },
      { read: true },
    );
  }

  async delete(notificationId: number, userId: number): Promise<void> {
    await this.notificationsRepository.delete({
      id: notificationId,
      user_id: userId,
    });
  }

  async notifyNewPost(
    userId: number,
    post: Post,
    topic: Topic,
  ): Promise<Notification> {
    return this.create(userId, NotificationType.NEW_POST, {
      post_id: post.id,
      topic_id: topic.id,
      topic_title: topic.title,
      post_preview: post.content.substring(0, 100),
    });
  }

  async notifyLike(
    userId: number,
    likedByUserId: number,
    post: Post,
  ): Promise<Notification> {
    return this.create(userId, NotificationType.LIKE, {
      post_id: post.id,
      liked_by_user_id: likedByUserId,
    });
  }

  async notifyMention(
    userId: number,
    mentionedByUserId: number,
    post: Post,
    topic: Topic,
  ): Promise<Notification> {
    return this.create(userId, NotificationType.MENTION, {
      post_id: post.id,
      topic_id: topic.id,
      topic_title: topic.title,
      mentioned_by_user_id: mentionedByUserId,
    });
  }
}

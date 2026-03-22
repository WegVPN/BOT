import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, LessThan } from 'typeorm';
import { Topic } from '../../entities/topic.entity';
import { Forum } from '../../entities/forum.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Forum)
    private forumsRepository: Repository<Forum>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async findByForum(
    forumId: number,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'updated_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ topics: Topic[]; total: number }> {
    const forum = await this.forumsRepository.findOne({ where: { id: forumId } });
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    const [topics, total] = await this.topicsRepository.findAndCount({
      where: { forum_id: forumId },
      relations: ['user', 'user.role'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        is_pinned: 'DESC',
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        title: true,
        is_pinned: true,
        is_closed: true,
        views_count: true,
        posts_count: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          nickname: true,
          avatar_url: true,
        },
      },
    });

    return { topics, total };
  }

  async findOne(id: number): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({
      where: { id },
      relations: ['forum', 'user', 'user.role'],
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Increment view count
    await this.topicsRepository.increment({ id }, 'views_count', 1);

    return topic;
  }

  async findWithPosts(id: number, page: number = 1, limit: number = 20): Promise<{
    topic: Topic;
    posts: Post[];
    total: number;
  }> {
    const topic = await this.findOne(id);

    const [posts, total] = await this.postsRepository.findAndCount({
      where: { topic_id: id, is_deleted: false },
      relations: ['user', 'user.role', 'attachments'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'ASC' },
    });

    return { topic, posts, total };
  }

  async create(userId: number, createDto: CreateTopicDto): Promise<Topic> {
    const forum = await this.forumsRepository.findOne({ where: { id: createDto.forum_id } });
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    if (forum.is_visible === false) {
      throw new BadRequestException('Forum is not visible');
    }

    const topic = this.topicsRepository.create({
      title: createDto.title,
      forum_id: createDto.forum_id,
      user_id: userId,
      posts_count: 1,
    });

    const savedTopic = await this.topicsRepository.save(topic);

    // Create first post
    const post = this.postsRepository.create({
      content: createDto.content,
      topic_id: savedTopic.id,
      user_id: userId,
    });
    await this.postsRepository.save(post);

    // Update topic with first post ID
    savedTopic.last_post_id = post.id;
    await this.topicsRepository.save(savedTopic);

    // Update forum stats
    await this.forumsRepository.increment({ id: createDto.forum_id }, 'topics_count', 1);
    await this.forumsRepository.increment({ id: createDto.forum_id }, 'posts_count', 1);
    await this.forumsRepository.update(createDto.forum_id, { last_topic_id: savedTopic.id });

    // Update user stats
    await this.usersRepository.increment({ id: userId }, 'topics_count', 1);
    await this.usersRepository.increment({ id: userId }, 'posts_count', 1);

    return this.findOne(savedTopic.id);
  }

  async update(
    id: number,
    updateDto: UpdateTopicDto,
    moderatorId?: number,
  ): Promise<Topic> {
    const topic = await this.findOne(id);

    if (updateDto.is_pinned !== undefined && topic.is_pinned !== updateDto.is_pinned) {
      topic.is_pinned = updateDto.is_pinned;
    }

    if (updateDto.is_closed !== undefined && topic.is_closed !== updateDto.is_closed) {
      topic.is_closed = updateDto.is_closed;
    }

    if (updateDto.title !== undefined) {
      topic.title = updateDto.title;
    }

    if (updateDto.forum_id !== undefined && updateDto.forum_id !== topic.forum_id) {
      const newForum = await this.forumsRepository.findOne({
        where: { id: updateDto.forum_id },
      });
      if (!newForum) {
        throw new NotFoundException('Target forum not found');
      }

      // Update old forum stats
      await this.forumsRepository.decrement({ id: topic.forum_id }, 'topics_count', 1);
      await this.forumsRepository.decrement({ id: topic.forum_id }, 'posts_count', topic.posts_count);

      // Update new forum stats
      await this.forumsRepository.increment({ id: updateDto.forum_id }, 'topics_count', 1);
      await this.forumsRepository.increment({ id: updateDto.forum_id }, 'posts_count', topic.posts_count);

      topic.forum_id = updateDto.forum_id;
    }

    await this.topicsRepository.save(topic);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const topic = await this.findOne(id);

    // Update forum stats
    await this.forumsRepository.decrement({ id: topic.forum_id }, 'topics_count', 1);
    await this.forumsRepository.decrement({ id: topic.forum_id }, 'posts_count', topic.posts_count);

    // Update user stats
    await this.usersRepository.decrement({ id: topic.user_id }, 'topics_count', 1);
    await this.usersRepository.decrement({ id: topic.user_id }, 'posts_count', topic.posts_count);

    await this.topicsRepository.delete(id);
  }

  async search(
    query: string,
    forumId?: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ topics: Topic[]; total: number }> {
    const where: any = {
      title: Like(`%${query}%`),
    };

    if (forumId) {
      where.forum_id = forumId;
    }

    const [topics, total] = await this.topicsRepository.findAndCount({
      where,
      relations: ['forum', 'user', 'user.role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: 'DESC' },
    });

    return { topics, total };
  }

  async getActiveTopics(limit: number = 10): Promise<Topic[]> {
    return this.topicsRepository.find({
      relations: ['forum', 'user', 'user.role'],
      take: limit,
      order: { updated_at: 'DESC' },
      where: {
        is_closed: false,
      },
    });
  }

  async subscribe(userId: number, topicId: number): Promise<void> {
    const topic = await this.findOne(topicId);
    // Implementation for subscription
  }

  async unsubscribe(userId: number, topicId: number): Promise<void> {
    // Implementation for unsubscription
  }
}

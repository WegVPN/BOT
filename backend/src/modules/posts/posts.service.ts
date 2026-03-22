import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { Topic } from '../../entities/topic.entity';
import { User } from '../../entities/user.entity';
import { Forum } from '../../entities/forum.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Forum)
    private forumsRepository: Repository<Forum>,
    private notificationsService: NotificationsService,
  ) {}

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'user.role', 'topic', 'attachments'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(userId: number, createDto: CreatePostDto): Promise<Post> {
    const topic = await this.topicsRepository.findOne({
      where: { id: createDto.topic_id },
      relations: ['forum', 'user'],
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.is_closed) {
      throw new BadRequestException('Topic is closed');
    }

    // Check if replying to a parent post
    let parentPost: Post | null = null;
    if (createDto.parent_post_id) {
      parentPost = await this.postsRepository.findOne({
        where: { id: createDto.parent_post_id },
      });
      if (!parentPost) {
        throw new NotFoundException('Parent post not found');
      }
    }

    const post = this.postsRepository.create({
      content: createDto.content,
      topic_id: createDto.topic_id,
      user_id: userId,
      parent_post_id: createDto.parent_post_id,
    });

    const savedPost = await this.postsRepository.save(post);

    // Update topic stats
    await this.topicsRepository.increment({ id: createDto.topic_id }, 'posts_count', 1);
    await this.topicsRepository.update(createDto.topic_id, { last_post_id: savedPost.id });

    // Update forum stats
    await this.forumsRepository.increment({ id: topic.forum_id }, 'posts_count', 1);
    await this.forumsRepository.update(topic.forum_id, { last_topic_id: topic.id });

    // Update user stats
    await this.usersRepository.increment({ id: userId }, 'posts_count', 1);

    // Notify topic creator if not the same user
    if (topic.user_id !== userId) {
      await this.notificationsService.notifyNewPost(topic.user_id, savedPost, topic);
    }

    return this.findOne(savedPost.id);
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdatePostDto,
    isModerator: boolean = false,
  ): Promise<Post> {
    const post = await this.findOne(id);

    // Check permissions
    if (post.user_id !== userId && !isModerator) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (updateDto.content !== undefined) {
      post.content = updateDto.content;
      post.edited_at = new Date();
    }

    await this.postsRepository.save(post);
    return this.findOne(id);
  }

  async delete(id: number, userId: number, isModerator: boolean = false): Promise<void> {
    const post = await this.findOne(id);
    const topic = await this.topicsRepository.findOne({
      where: { id: post.topic_id },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check permissions
    if (post.user_id !== userId && !isModerator) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete
    post.is_deleted = true;
    post.content = '[Deleted]';
    await this.postsRepository.save(post);

    // Update stats
    await this.topicsRepository.decrement({ id: post.topic_id }, 'posts_count', 1);
    await this.forumsRepository.decrement({ id: topic.forum_id }, 'posts_count', 1);
    await this.usersRepository.decrement({ id: post.user_id }, 'posts_count', 1);
  }

  async like(id: number, userId: number): Promise<Post> {
    const post = await this.findOne(id);

    if (post.user_id === userId) {
      throw new BadRequestException('You cannot like your own post');
    }

    // Check if already liked
    const likedBy = post.liked_by || [];
    if (likedBy.includes(userId)) {
      throw new BadRequestException('You already liked this post');
    }

    likedBy.push(userId);
    post.liked_by = likedBy;
    post.likes_count = (post.likes_count || 0) + 1;

    await this.postsRepository.save(post);

    // Notify post author
    if (post.user_id !== userId) {
      await this.notificationsService.notifyLike(post.user_id, userId, post);
    }

    return this.findOne(id);
  }

  async unlike(id: number, userId: number): Promise<Post> {
    const post = await this.findOne(id);

    const likedBy = post.liked_by || [];
    const index = likedBy.indexOf(userId);

    if (index === -1) {
      throw new BadRequestException('You have not liked this post');
    }

    likedBy.splice(index, 1);
    post.liked_by = likedBy;
    post.likes_count = Math.max(0, (post.likes_count || 0) - 1);

    await this.postsRepository.save(post);
    return this.findOne(id);
  }

  async getPostsByUser(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postsRepository.findAndCount({
      where: { user_id: userId, is_deleted: false },
      relations: ['topic', 'topic.forum'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { posts, total };
  }
}

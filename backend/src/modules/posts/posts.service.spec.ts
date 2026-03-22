import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { Topic } from '../../entities/topic.entity';
import { User } from '../../entities/user.entity';
import { Forum } from '../../entities/forum.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: Repository<Post>;
  let topicsRepository: Repository<Topic>;
  let usersRepository: Repository<User>;
  let forumsRepository: Repository<Forum>;

  const mockPost: Partial<Post> = {
    id: 1,
    content: 'Test post content',
    topic_id: 1,
    user_id: 1,
    likes_count: 0,
    is_deleted: false,
  };

  const mockTopic: Partial<Topic> = {
    id: 1,
    title: 'Test Topic',
    forum_id: 1,
    user_id: 1,
    is_closed: false,
    posts_count: 1,
  };

  const mockRepositories = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepositories,
        },
        {
          provide: getRepositoryToken(Topic),
          useValue: mockRepositories,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositories,
        },
        {
          provide: getRepositoryToken(Forum),
          useValue: mockRepositories,
        },
        {
          provide: NotificationsService,
          useValue: { notifyNewPost: jest.fn(), notifyLike: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    topicsRepository = module.get<Repository<Topic>>(getRepositoryToken(Topic));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      mockRepositories.findOne.mockResolvedValueOnce(mockTopic);
      mockRepositories.create.mockReturnValue({ ...mockPost, id: undefined });
      mockRepositories.save.mockResolvedValue({ ...mockPost, id: 2 });
      mockRepositories.findOne.mockResolvedValueOnce({ ...mockPost, id: 2 });

      const result = await service.create(1, {
        topic_id: 1,
        content: 'New post content',
      });

      expect(result).toBeDefined();
      expect(postsRepository.create).toHaveBeenCalled();
      expect(postsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if topic not found', async () => {
      mockRepositories.findOne.mockResolvedValue(null);

      await expect(
        service.create(1, { topic_id: 999, content: 'Content' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if topic is closed', async () => {
      mockRepositories.findOne.mockResolvedValue({ ...mockTopic, is_closed: true });

      await expect(
        service.create(1, { topic_id: 1, content: 'Content' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('like', () => {
    it('should increment like count', async () => {
      mockRepositories.findOne.mockResolvedValue({
        ...mockPost,
        user_id: 2,
        liked_by: [],
        likes_count: 0,
      });
      mockRepositories.save.mockResolvedValue({
        ...mockPost,
        user_id: 2,
        liked_by: [1],
        likes_count: 1,
      });

      const result = await service.like(1, 1);

      expect(result.likes_count).toBe(1);
      expect(postsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if liking own post', async () => {
      mockRepositories.findOne.mockResolvedValue({ ...mockPost, user_id: 1 });

      await expect(service.like(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});

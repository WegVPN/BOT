import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from '../../entities/forum.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(Forum)
    private forumsRepository: Repository<Forum>,
  ) {}

  async findAll(): Promise<Forum[]> {
    return this.forumsRepository.find({
      order: { sort_order: 'ASC' },
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: number): Promise<Forum[]> {
    return this.forumsRepository.find({
      where: { category_id: categoryId },
      order: { sort_order: 'ASC' },
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<Forum> {
    const forum = await this.forumsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  async create(createDto: CreateForumDto): Promise<Forum> {
    const forum = this.forumsRepository.create(createDto);
    return this.forumsRepository.save(forum);
  }

  async update(id: number, updateDto: UpdateForumDto): Promise<Forum> {
    await this.findOne(id);
    await this.forumsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.forumsRepository.delete(id);
  }

  async incrementTopicsCount(forumId: number): Promise<void> {
    await this.forumsRepository.increment({ id: forumId }, 'topics_count', 1);
  }

  async incrementPostsCount(forumId: number): Promise<void> {
    await this.forumsRepository.increment({ id: forumId }, 'posts_count', 1);
  }

  async updateLastTopic(forumId: number, topicId: number): Promise<void> {
    await this.forumsRepository.update(forumId, { last_topic_id: topicId });
  }
}

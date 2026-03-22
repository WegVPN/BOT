import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import { Role, Permission } from '../../entities/role.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
        signature: true,
        status: true,
        reputation: true,
        topics_count: true,
        posts_count: true,
        created_at: true,
        last_seen: true,
        role: {
          id: true,
          name: true,
        },
      },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { nickname },
      relations: ['role'],
    });
  }

  async updateProfile(userId: number, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if nickname is taken by another user
    if (updateDto.nickname && updateDto.nickname !== user.nickname) {
      const existingUser = await this.usersRepository.findOne({
        where: { nickname: updateDto.nickname },
      });
      if (existingUser) {
        throw new BadRequestException('Nickname already taken');
      }
    }

    await this.usersRepository.update(userId, updateDto);
    return this.findById(userId);
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    await this.usersRepository.update(userId, { avatar_url: avatarUrl });
    return this.findById(userId);
  }

  async incrementReputation(userId: number, amount: number = 1): Promise<User> {
    await this.usersRepository.increment({ id: userId }, 'reputation', amount);
    return this.findById(userId);
  }

  async incrementStats(userId: number, field: 'topics_count' | 'posts_count'): Promise<void> {
    await this.usersRepository.increment({ id: userId }, field, 1);
  }

  async decrementStats(userId: number, field: 'topics_count' | 'posts_count'): Promise<void> {
    await this.usersRepository.decrement({ id: userId }, field, 1);
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return this.usersRepository.find({
      where: [
        { nickname: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      relations: ['role'],
      take: limit,
      select: {
        id: true,
        nickname: true,
        avatar_url: true,
        reputation: true,
      },
    });
  }

  async banUser(userId: number, moderatorId: number): Promise<User> {
    await this.usersRepository.update(userId, { status: UserStatus.BANNED });
    return this.findById(userId);
  }

  async unbanUser(userId: number): Promise<User> {
    await this.usersRepository.update(userId, { status: UserStatus.ACTIVE });
    return this.findById(userId);
  }

  async changeRole(userId: number, roleId: number): Promise<User> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.usersRepository.update(userId, { role_id: roleId });
    return this.findById(userId);
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
        status: true,
        reputation: true,
        created_at: true,
        last_seen: true,
        role: {
          id: true,
          name: true,
        },
      },
    });

    return { users, total };
  }

  async getUserStats(userId: number): Promise<{
    topics_count: number;
    posts_count: number;
    reputation: number;
    created_at: Date;
    last_seen: Date;
  } | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['topics_count', 'posts_count', 'reputation', 'created_at', 'last_seen'],
    });

    if (!user) return null;

    return {
      topics_count: user.topics_count,
      posts_count: user.posts_count,
      reputation: user.reputation,
      created_at: user.created_at,
      last_seen: user.last_seen,
    };
  }
}

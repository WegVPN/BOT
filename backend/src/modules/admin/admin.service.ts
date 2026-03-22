import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import { Role, Permission } from '../../entities/role.entity';
import { Forum } from '../../entities/forum.entity';
import { Topic } from '../../entities/topic.entity';
import { Post } from '../../entities/post.entity';
import { ModerationLog, ModerationActionType } from '../../entities/moderation-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Forum)
    private forumsRepository: Repository<Forum>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(ModerationLog)
    private moderationLogsRepository: Repository<ModerationLog>,
  ) {}

  // Dashboard statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalTopics,
      totalPosts,
      totalForums,
      activeUsersToday,
      newUsersToday,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.topicsRepository.count(),
      this.postsRepository.count(),
      this.forumsRepository.count(),
      this.usersRepository.count({
        where: {
          last_seen: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      this.usersRepository.count({
        where: {
          created_at: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

    return {
      total_users: totalUsers,
      total_topics: totalTopics,
      total_posts: totalPosts,
      total_forums: totalForums,
      active_users_today: activeUsersToday,
      new_users_today: newUsersToday,
    };
  }

  // User management
  async getAllUsers(page: number = 1, limit: number = 20) {
    const [users, total] = await this.usersRepository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { users, total, page, limit };
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async banUser(userId: number, moderatorId: number, reason?: string): Promise<User> {
    await this.usersRepository.update(userId, { status: UserStatus.BANNED });

    await this.logModerationAction({
      moderator_id: moderatorId,
      target_user_id: userId,
      action_type: ModerationActionType.USER_BANNED,
      details: { reason },
    });

    return this.getUserById(userId);
  }

  async unbanUser(userId: number, moderatorId: number): Promise<User> {
    await this.usersRepository.update(userId, { status: UserStatus.ACTIVE });

    await this.logModerationAction({
      moderator_id: moderatorId,
      target_user_id: userId,
      action_type: ModerationActionType.USER_UNBANNED,
      details: {},
    });

    return this.getUserById(userId);
  }

  async changeUserRole(
    userId: number,
    roleId: number,
    moderatorId: number,
  ): Promise<User> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.usersRepository.update(userId, { role_id: roleId });

    await this.logModerationAction({
      moderator_id: moderatorId,
      target_user_id: userId,
      action_type: ModerationActionType.USER_ROLE_CHANGED,
      details: { new_role_id: roleId, new_role_name: role.name },
    });

    return this.getUserById(userId);
  }

  // Role management
  async getAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async createRole(name: string, permissions: Permission[]): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    const role = this.rolesRepository.create({ name, permissions });
    return this.rolesRepository.save(role);
  }

  async updateRole(
    id: number,
    name?: string,
    permissions?: Permission[],
  ): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (name) role.name = name;
    if (permissions) role.permissions = permissions;

    return this.rolesRepository.save(role);
  }

  // Forum management
  async getAllForums() {
    return this.forumsRepository.find({
      relations: ['category'],
      order: { sort_order: 'ASC' },
    });
  }

  // Moderation logs
  async getModerationLogs(
    page: number = 1,
    limit: number = 20,
    moderatorId?: number,
  ) {
    const where: any = {};
    if (moderatorId) {
      where.moderator_id = moderatorId;
    }

    const [logs, total] = await this.moderationLogsRepository.findAndCount({
      where,
      relations: ['moderator', 'target_user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { logs, total, page, limit };
  }

  private async logModerationAction(data: {
    moderator_id: number;
    target_user_id?: number;
    action_type: ModerationActionType;
    details: Record<string, any>;
  }): Promise<ModerationLog> {
    const log = this.moderationLogsRepository.create(data);
    return this.moderationLogsRepository.save(log);
  }

  // Topic moderation
  async closeTopic(
    topicId: number,
    moderatorId: number,
  ): Promise<Topic> {
    await this.topicsRepository.update(topicId, { is_closed: true });

    await this.logModerationAction({
      moderator_id: moderatorId,
      action_type: ModerationActionType.TOPIC_CLOSED,
      details: { topic_id: topicId },
    });

    return this.topicsRepository.findOne({ where: { id: topicId } });
  }

  async openTopic(topicId: number, moderatorId: number): Promise<Topic> {
    await this.topicsRepository.update(topicId, { is_closed: false });

    await this.logModerationAction({
      moderator_id: moderatorId,
      action_type: ModerationActionType.TOPIC_OPENED,
      details: { topic_id: topicId },
    });

    return this.topicsRepository.findOne({ where: { id: topicId } });
  }

  async pinTopic(topicId: number, moderatorId: number): Promise<Topic> {
    await this.topicsRepository.update(topicId, { is_pinned: true });

    await this.logModerationAction({
      moderator_id: moderatorId,
      action_type: ModerationActionType.TOPIC_PINNED,
      details: { topic_id: topicId },
    });

    return this.topicsRepository.findOne({ where: { id: topicId } });
  }

  async unpinTopic(topicId: number, moderatorId: number): Promise<Topic> {
    await this.topicsRepository.update(topicId, { is_pinned: false });

    await this.logModerationAction({
      moderator_id: moderatorId,
      action_type: ModerationActionType.TOPIC_UNPINNED,
      details: { topic_id: topicId },
    });

    return this.topicsRepository.findOne({ where: { id: topicId } });
  }

  async moveTopic(
    topicId: number,
    newForumId: number,
    moderatorId: number,
  ): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const oldForumId = topic.forum_id;
    await this.topicsRepository.update(topicId, { forum_id: newForumId });

    // Update forum stats
    await this.forumsRepository.decrement({ id: oldForumId }, 'topics_count', 1);
    await this.forumsRepository.increment({ id: newForumId }, 'topics_count', 1);

    await this.logModerationAction({
      moderator_id: moderatorId,
      action_type: ModerationActionType.TOPIC_MOVED,
      details: { topic_id: topicId, old_forum_id: oldForumId, new_forum_id: newForumId },
    });

    return this.topicsRepository.findOne({ where: { id: topicId } });
  }
}

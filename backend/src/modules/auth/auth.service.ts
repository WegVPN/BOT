import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserStatus } from '../../entities/user.entity';
import { Role, Permission } from '../../entities/role.entity';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user || !user.password_hash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return null;
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account has been banned');
    }

    return user;
  }

  async register(email: string, password: string, nickname: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { nickname }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.nickname === nickname) {
        throw new ConflictException('Nickname already taken');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Get or create default user role
    let userRole = await this.rolesRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      userRole = this.rolesRepository.create({
        name: 'user',
        permissions: [
          Permission.READ_FORUM,
          Permission.CREATE_TOPIC,
          Permission.CREATE_POST,
          Permission.EDIT_OWN_POST,
          Permission.DELETE_OWN_POST,
        ],
      });
      await this.rolesRepository.save(userRole);
    }

    const user = this.usersRepository.create({
      email,
      password_hash: passwordHash,
      nickname,
      role: userRole,
      status: UserStatus.ACTIVE,
      email_verified_at: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async login(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role?.name || 'user',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    await this.usersRepository.update(user.id, {
      refresh_token: refreshToken,
      last_seen: new Date(),
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Account is banned');
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      refresh_token: null,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async findOrCreateOAuthUser(
    provider: 'google' | 'github',
    providerId: string,
    email: string,
    nickname: string,
  ): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: [{ email }, { [`${provider}_id`]: providerId }],
      relations: ['role'],
    });

    if (user) {
      // Update provider ID if not set
      if (!user[`${provider}_id`]) {
        user[`${provider}_id`] = providerId;
        await this.usersRepository.save(user);
      }
      return user;
    }

    // Get or create default user role
    let userRole = await this.rolesRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      userRole = this.rolesRepository.create({
        name: 'user',
        permissions: [
          Permission.READ_FORUM,
          Permission.CREATE_TOPIC,
          Permission.CREATE_POST,
          Permission.EDIT_OWN_POST,
          Permission.DELETE_OWN_POST,
        ],
      });
      await this.rolesRepository.save(userRole);
    }

    // Ensure unique nickname
    const baseNickname = nickname || email.split('@')[0];
    let uniqueNickname = baseNickname;
    let counter = 1;
    while (await this.usersRepository.findOne({ where: { nickname: uniqueNickname } })) {
      uniqueNickname = `${baseNickname}_${counter}`;
      counter++;
    }

    user = this.usersRepository.create({
      email,
      nickname: uniqueNickname,
      [`${provider}_id`]: providerId,
      role: userRole,
      status: UserStatus.ACTIVE,
      email_verified_at: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return true;
    }

    // Generate reset token (in production, send via email)
    const resetToken = uuidv4();
    // Store token hash in DB (implementation depends on email service)
    // For now, just return true
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Verify token and update password
    // Implementation depends on token storage
    return true;
  }

  async hasPermission(user: User, permission: Permission): Promise<boolean> {
    if (!user.role) {
      return false;
    }
    return user.role.permissions.includes(permission);
  }
}

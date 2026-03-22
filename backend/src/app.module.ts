import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-yet';
import { ConfigService } from '@nestjs/config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ForumsModule } from './modules/forums/forums.module';
import { TopicsModule } from './modules/topics/topics.module';
import { PostsModule } from './modules/posts/posts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import { Forum } from './entities/forum.entity';
import { Topic } from './entities/topic.entity';
import { Post } from './entities/post.entity';
import { PrivateMessage } from './entities/private-message.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Notification } from './entities/notification.entity';
import { Attachment } from './entities/attachment.entity';
import { ModerationLog } from './entities/moderation-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          User,
          Role,
          Category,
          Forum,
          Topic,
          Post,
          PrivateMessage,
          UserSubscription,
          Notification,
          Attachment,
          ModerationLog,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: 300, // 5 minutes default
        max: 1000,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLER_TTL') || 60,
            limit: configService.get<number>('THROTTLER_LIMIT') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ForumsModule,
    TopicsModule,
    PostsModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {}

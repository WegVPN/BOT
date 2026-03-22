import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  NEW_POST = 'new_post',
  TOPIC_MOVED = 'topic_moved',
  TOPIC_CLOSED = 'topic_closed',
  TOPIC_PINNED = 'topic_pinned',
  MENTION = 'mention',
  LIKE = 'like',
  PRIVATE_MESSAGE = 'private_message',
  WARNING = 'warning',
  BAN = 'ban',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column('simple-json')
  data: Record<string, any>;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;
}

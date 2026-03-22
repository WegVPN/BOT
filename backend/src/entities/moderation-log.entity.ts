import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ModerationActionType {
  TOPIC_CLOSED = 'topic_closed',
  TOPIC_OPENED = 'topic_opened',
  TOPIC_PINNED = 'topic_pinned',
  TOPIC_UNPINNED = 'topic_unpinned',
  TOPIC_MOVED = 'topic_moved',
  POST_DELETED = 'post_deleted',
  POST_EDITED = 'post_edited',
  USER_WARNED = 'user_warned',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  USER_ROLE_CHANGED = 'user_role_changed',
}

@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ModerationActionType })
  action_type: ModerationActionType;

  @Column('simple-json')
  details: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @Column()
  moderator_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'target_user_id' })
  target_user: User | null;

  @Column({ nullable: true })
  target_user_id: number;
}

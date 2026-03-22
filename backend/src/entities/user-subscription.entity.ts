import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Forum } from './forum.entity';
import { Topic } from './topic.entity';

export enum SubscriptionType {
  FORUM = 'forum',
  TOPIC = 'topic',
}

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SubscriptionType })
  target_type: SubscriptionType;

  @Column({ nullable: true })
  target_id: number;

  @Column({ default: true })
  email_notifications: boolean;

  @Column({ default: true })
  push_notifications: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Forum, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'forum_id' })
  forum: Forum;

  @Column({ nullable: true })
  forum_id: number;

  @ManyToOne(() => Topic, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ nullable: true })
  topic_id: number;
}

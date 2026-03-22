import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Forum } from './forum.entity';
import { User } from './user.entity';
import { Post } from './post.entity';
import { UserSubscription } from './user-subscription.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  is_pinned: boolean;

  @Column({ default: false })
  is_closed: boolean;

  @Column({ default: 0 })
  views_count: number;

  @Column({ default: 0 })
  posts_count: number;

  @Column({ nullable: true })
  last_post_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Forum, (forum) => forum.topics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'forum_id' })
  forum: Forum;

  @Column()
  forum_id: number;

  @ManyToOne(() => User, (user) => user.topics)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(() => Post, (post) => post.topic, { cascade: true })
  posts: Post[];

  @OneToMany(() => UserSubscription, (sub) => sub.topic)
  subscriptions: UserSubscription[];
}

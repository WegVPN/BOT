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
import { Role } from './role.entity';
import { Topic } from './topic.entity';
import { Post } from './post.entity';
import { PrivateMessage } from './private-message.entity';
import { UserSubscription } from './user-subscription.entity';
import { Notification } from './notification.entity';
import { Attachment } from './attachment.entity';

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  signature: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ default: 0 })
  reputation: number;

  @Column({ default: 0 })
  topics_count: number;

  @Column({ default: 0 })
  posts_count: number;

  @Column({ nullable: true })
  google_id: string;

  @Column({ nullable: true })
  github_id: string;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column({ nullable: true })
  last_seen: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  role_id: number;

  @Column({ nullable: true })
  refresh_token: string;

  @OneToMany(() => Topic, (topic) => topic.user)
  topics: Topic[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => PrivateMessage, (pm) => pm.sender, { cascade: true })
  sent_messages: PrivateMessage[];

  @OneToMany(() => PrivateMessage, (pm) => pm.recipient, { cascade: true })
  received_messages: PrivateMessage[];

  @OneToMany(() => UserSubscription, (sub) => sub.user)
  subscriptions: UserSubscription[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @OneToMany(() => Attachment, (att) => att.user)
  attachments: Attachment[];
}

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
import { Topic } from './topic.entity';
import { User } from './user.entity';
import { Attachment } from './attachment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  likes_count: number;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  edited_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Topic, (topic) => topic.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column()
  topic_id: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  parent_post_id: number;

  @ManyToOne(() => Post, (post) => post.replies)
  @JoinColumn({ name: 'parent_post_id' })
  parent_post: Post;

  @OneToMany(() => Post, (post) => post.parent_post)
  replies: Post[];

  @OneToMany(() => Attachment, (att) => att.post)
  attachments: Attachment[];

  @Column('simple-json', { nullable: true })
  liked_by: number[];
}

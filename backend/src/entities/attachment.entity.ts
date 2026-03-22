import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file_path: string;

  @Column()
  original_name: string;

  @Column()
  mime_type: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Post, (post) => post.attachments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ nullable: true })
  post_id: number;

  @ManyToOne(() => User, (user) => user.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;
}

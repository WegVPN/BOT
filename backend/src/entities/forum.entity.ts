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
import { Category } from './category.entity';
import { Topic } from './topic.entity';

@Entity('forums')
export class Forum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ default: true })
  is_visible: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: 0 })
  topics_count: number;

  @Column({ default: 0 })
  posts_count: number;

  @Column({ nullable: true })
  last_topic_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Category, (category) => category.forums, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: number;

  @OneToMany(() => Topic, (topic) => topic.forum)
  topics: Topic[];
}

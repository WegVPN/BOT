import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('private_messages')
export class PrivateMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  read_at: Date;

  @Column({ nullable: true })
  deleted_by_sender: boolean;

  @Column({ nullable: true })
  deleted_by_recipient: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.sent_messages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  sender_id: number;

  @ManyToOne(() => User, (user) => user.received_messages)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ nullable: true })
  recipient_id: number;

  @Column({ nullable: true })
  group_id: string;
}

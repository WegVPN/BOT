import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum Permission {
  READ_FORUM = 'read_forum',
  CREATE_TOPIC = 'create_topic',
  CREATE_POST = 'create_post',
  EDIT_OWN_POST = 'edit_own_post',
  DELETE_OWN_POST = 'delete_own_post',
  EDIT_ANY_POST = 'edit_any_post',
  DELETE_ANY_POST = 'delete_any_post',
  CLOSE_TOPIC = 'close_topic',
  PIN_TOPIC = 'pin_topic',
  MOVE_TOPIC = 'move_topic',
  BAN_USER = 'ban_user',
  MANAGE_USERS = 'manage_users',
  MANAGE_FORUMS = 'manage_forums',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_MOD_LOGS = 'view_mod_logs',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('simple-json')
  permissions: Permission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}

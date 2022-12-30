import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ engine: 'InnoDB' })
export class User {
  @PrimaryGeneratedColumn({ comment: '主键', unsigned: true })
  id: number;

  @Column({ comment: '微信openid', length: 60, unique: true })
  openid: string;

  @Column({ comment: '微信unionid', length: 60, unique: true })
  unionid: string;

  @Column({ comment: '微信session_key', length: 60 })
  sessionKey: string;

  @Column({ comment: '用户名', length: 32 })
  username: string;

  @Column({ comment: '昵称', length: 60 })
  nickname: string;

  @Column({ comment: '头像' })
  avatarUrl: string;

  @Column({ comment: '手机号', length: 20 })
  mobile: string;

  @Column('tinyint', { comment: '是否启用 1:是  -1:否', default: 1 })
  isUsed: number;

  @Column('tinyint', { comment: '是否删除 1:是  -1:否', default: -1 })
  isDeleted: number;

  @Column('timestamp', {
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string;

  @Column({ comment: '创建人', length: 60 })
  createdUser: string;

  @Column('timestamp', {
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: string;

  @Column({ comment: '更新人', length: 60 })
  updatedUser: string;
}

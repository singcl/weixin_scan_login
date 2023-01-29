import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// TABLE COMMENT HAO TO SET ?
// 已授权接口地址表
@Entity({ engine: 'InnoDB' })
export class AuthorizedAPI {
  @PrimaryGeneratedColumn({ comment: '主键', unsigned: true })
  id: number;

  @Column({ comment: '调用方key', length: 32, default: '' })
  businessKey: string;

  @Column({ comment: '请求方式', length: 30, default: '' })
  method: string;

  @Column({ comment: '请求地址', length: 30, default: '' })
  api: string;

  @Column('tinyint', { comment: '是否删除 1:是  -1:否', default: -1 })
  isDeleted: number;

  @Column('timestamp', {
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: string;

  @Column({ comment: '创建人', length: 60, default: '' })
  createdUser: string;

  @Column('timestamp', {
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: string;

  @Column({ comment: '更新人', length: 60, default: '' })
  updatedUser: string;
}

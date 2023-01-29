import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// TABLE COMMENT HAO TO SET ?
@Entity({ engine: 'InnoDB' })
export class Authorized {
  @PrimaryGeneratedColumn({ comment: '主键', unsigned: true })
  id: number;

  @Column({ comment: '调用方key', length: 32, default: '' })
  businessKey: string;

  @Column({ comment: '调用方secret', length: 60, default: '', unique: true })
  businessSecret: string;

  @Column({ comment: '调用方对接人', length: 60, default: '' })
  businessDeveloper: string;

  @Column({ comment: '备注', default: '' })
  remark: string;

  @Column('tinyint', { comment: '是否启用 1:是  -1:否', default: 1 })
  isUsed: number;

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

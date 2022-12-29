import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// TODO: 完善entity
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  openid: string;

  @Column()
  nickname: string;

  @Column()
  mobile: string;

  @Column({ default: true })
  is_active: boolean;
}

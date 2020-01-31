import {
  BaseEntity,
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
export class Link extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  original: string;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    type => User,
    user => user.links,
  )
  user: User;
}

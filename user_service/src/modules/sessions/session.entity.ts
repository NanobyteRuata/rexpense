import { User } from 'src/modules/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('user_deviceId', ['user', 'deviceId'])
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.auth, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('varchar', { nullable: false })
  deviceId: string;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;

  @Column('timestamp', { nullable: false })
  expiresAt: Date;

  @Column('timestamp', { default: 'NOW' })
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  updatedAt: Date;
}

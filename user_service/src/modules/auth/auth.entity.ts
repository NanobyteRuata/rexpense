import { User } from '../users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.auth, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  password: string;

  @Column({ nullable: true, default: null, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ nullable: true, default: null, type: 'timestamp' })
  resetPasswordExpires: Date | null;

  @Column({ default: 0 })
  resetPasswordAttempts: number;
}

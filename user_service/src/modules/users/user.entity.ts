import { Auth } from 'src/modules/auth/auth.entity';
import { Session } from 'src/modules/sessions/session.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth?: Auth;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @Column('boolean', { default: false })
  isAdmin: boolean;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('timestamp', { default: 'NOW' })
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  updatedAt: Date;
}

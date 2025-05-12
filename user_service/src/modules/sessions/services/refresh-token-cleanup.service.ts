import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../session.entity';

@Injectable()
export class RefreshTokenCleanupService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR) // Runs every hour
  async removeExpiredTokens() {
    const now = new Date();
    const result = await this.sessionRepository.delete({
      expiresAt: LessThan(now),
    });
    console.log(`Removed ${result.affected} expired refresh tokens.`);
  }
}

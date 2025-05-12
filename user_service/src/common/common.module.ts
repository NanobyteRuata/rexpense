import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [EmailService],
  exports: [EmailService, JwtModule, ConfigModule],
})
export class CommonModule {}

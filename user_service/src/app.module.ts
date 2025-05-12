import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    KafkaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: Boolean(process.env.DB_SYNCHRONIZE),
    }),
  ],
})
export class AppModule {}

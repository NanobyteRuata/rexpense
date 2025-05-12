import { Injectable } from '@nestjs/common';
import { Session } from './session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { toMs } from 'ms-typescript';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ResponseFormat } from 'src/common/models/response-format.model';
import { SessionDto } from './dtos/responses/session.dto';

@Injectable()
export class SessionsService {
  private readonly DEFAULT_REFRESH_EXPIRE_IN = '7d';

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private configService: ConfigService,
  ) {}

  private getNewTokenExpiresAt(): Date {
    const expireIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRE_IN') ??
      this.DEFAULT_REFRESH_EXPIRE_IN;

    const expireInMs = toMs(expireIn);
    const todayMs = new Date().getTime();
    return new Date(todayMs + expireInMs);
  }

  async getSession(userId: number, deviceId: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { user: { id: userId }, deviceId },
      relations: ['user'], // include user to get last updated isAdmin
    });
  }

  async findAll(options: IPaginationOptions): Promise<ResponseFormat> {
    const { items, meta } = await paginate<Session>(
      this.sessionRepository,
      options,
    );

    // exclude refreshTokens for security reasons
    const sessionDtos = items.map((session) => new SessionDto(session));

    return new ResponseFormat({
      status: 'success',
      message: 'Sessions fetched successfully',
      data: sessionDtos,
      pagination: meta,
    });
  }

  async findByUserId(
    id: number,
    options: IPaginationOptions,
  ): Promise<ResponseFormat> {
    const { items, meta } = await paginate<Session>(
      this.sessionRepository,
      options,
      { where: { user: { id } } },
    );

    // exclude refreshTokens for security reasons
    const sessionDtos = items.map((session) => new SessionDto(session));

    return new ResponseFormat({
      status: 'success',
      message: 'Sessions fetched successfully',
      data: sessionDtos,
      pagination: meta,
    });
  }

  async upsert(
    userId: number,
    hashedRefreshToken: string,
    deviceId: string,
    expiresAt = this.getNewTokenExpiresAt(),
  ): Promise<Session | null> {
    await this.sessionRepository.upsert(
      {
        user: { id: userId },
        deviceId,
        refreshToken: hashedRefreshToken,
        expiresAt,
      },
      ['user', 'deviceId'],
    );
    return await this.sessionRepository.findOneBy({
      user: { id: userId },
      deviceId,
    });
  }

  async delete(
    userId: number,
    deviceId: string | string[],
  ): Promise<DeleteResult> {
    if (Array.isArray(deviceId)) {
      return await this.sessionRepository.delete({
        user: { id: userId },
        deviceId: In(deviceId),
      });
    }

    return await this.sessionRepository.delete({
      user: { id: userId },
      deviceId,
    });
  }

  async endSession(
    userId: number,
    deviceId: string | string[],
  ): Promise<ResponseFormat> {
    await this.delete(userId, deviceId);
    return new ResponseFormat({
      status: 'success',
      message: 'Sessions ended successfully',
    });
  }

  async endAllUserSessions(userId: number): Promise<ResponseFormat> {
    await this.sessionRepository.delete({ user: { id: userId } });

    return new ResponseFormat({
      status: 'success',
      message: 'All user sessions ended successfully',
    });
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Admin, Self } from 'src/modules/auth/auth.constant';
import { FindAllSessionsParams } from './dtos/params/find-all-sessions.params';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger/dist/decorators';
import { EndSessionDto } from './dtos/requests/end-session.dto';

@ApiBearerAuth('Bearer')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Admin()
  @Self()
  @Get()
  @ApiOperation({ summary: 'Get all sessions with pagination' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() { page, limit, userId }: FindAllSessionsParams) {
    if (userId) {
      return this.sessionsService.findByUserId(userId, { page, limit });
    }

    return this.sessionsService.findAll({ page, limit });
  }

  @Admin()
  @Self()
  @Post('end-session')
  @ApiOperation({ summary: 'End user sessions' })
  @ApiResponse({ status: 200, description: 'Sessions ended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  endSession(@Body() payload: EndSessionDto) {
    return this.sessionsService.endSession(payload.userId, payload.deviceIds);
  }
}

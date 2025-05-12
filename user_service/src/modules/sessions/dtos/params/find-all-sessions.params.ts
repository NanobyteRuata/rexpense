import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class FindAllSessionsParams {
  @ApiPropertyOptional({ name: 'page', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ name: 'limit', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ name: 'user_id' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}

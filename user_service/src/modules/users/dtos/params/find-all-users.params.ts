import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, Min, IsOptional } from 'class-validator';

export class FindAllUsersParams {
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

  @ApiPropertyOptional({ name: 'is_active' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;
}

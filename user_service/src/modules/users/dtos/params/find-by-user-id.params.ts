import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class FindByUserIdParams {
  @ApiProperty({ name: 'user_id', required: true })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  userId: number;
}

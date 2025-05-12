import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    name: 'name',
    description: 'User display name',
    example: 'John Doe',
    minLength: 3,
    type: String,
  })
  @Length(3)
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    name: 'email',
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    name: 'is_active',
    description: 'User account status',
    example: true,
    default: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

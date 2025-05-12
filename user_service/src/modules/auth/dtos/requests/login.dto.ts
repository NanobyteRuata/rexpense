import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    name: 'email',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
    uniqueItems: true,
    description: 'User email address',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    example: 'password123',
    type: String,
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    name: 'device_id',
    example: 'device123',
    type: String,
    description: 'Device ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}

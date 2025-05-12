import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    name: 'email',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
    description: 'User email address',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'resetPasswordToken',
    example: '123456',
    type: String,
    description: 'Six-digit OTP code',
  })
  @Matches(/^[0-9]{6}$/, {
    message: 'OTP must be exactly 6 digits',
  })
  @Length(6, 6)
  @IsString()
  @IsNotEmpty()
  resetPasswordToken: string;

  @ApiProperty({
    name: 'password',
    example: 'newPassword123',
    type: String,
    description: 'New password',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  @Length(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

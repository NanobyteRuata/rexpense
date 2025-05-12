import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
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
}

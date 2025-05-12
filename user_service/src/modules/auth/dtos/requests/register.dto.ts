import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    name: 'name',
    example: 'John Doe',
    type: String,
    description: 'User display name',
  })
  @Length(3)
  @IsString()
  @IsNotEmpty()
  name: string;

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  @Length(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

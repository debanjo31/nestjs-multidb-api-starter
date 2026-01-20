import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from '@nestjs/class-validator';

enum ProfileType {
  User = 'user',
  Merchant = 'merchant',
  Admin = 'admin',
}

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Transform((s) => String(s.value).trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'User password (8-20 characters)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is too short (8 characters min)' })
  @MaxLength(20, { message: 'Password is too long (20 characters max)' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Profile type',
    example: 'user',
    enum: ProfileType,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(ProfileType)
  profileType: string;

  @ApiProperty({
    description: 'URL to redirect after email verification',
    example: 'https://app.starter-api.com/verify-success',
  })
  @IsString()
  @IsNotEmpty()
  verifyRedirectUrl: string;
}

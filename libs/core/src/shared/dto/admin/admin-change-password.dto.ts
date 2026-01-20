import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from '@nestjs/class-validator';

export class AdminChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'OldPass123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Current password is too short (8 characters min)' })
  @MaxLength(20, { message: 'Current password is too long (20 characters max)' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password is too short (8 characters min)' })
  @MaxLength(20, { message: 'New password is too long (20 characters max)' })
  newPassword: string;
}

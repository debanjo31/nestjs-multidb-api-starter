import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { Transform, Type } from 'class-transformer';
import { MobileDto } from '../mobile.dto';

export class UpdatePasswordCodeDto {
  @ApiPropertyOptional({
    description: 'User email address (required if mobile not provided)',
    example: 'user@example.com',
  })
  @Transform((s) => String(s.value).trim().toLowerCase())
  @IsNotEmpty()
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsString()
  readonly email: string;

  @ApiPropertyOptional({
    description: 'Mobile number details (required if email not provided)',
    type: () => MobileDto,
  })
  @IsNotEmpty()
  @ValidateNested({ message: 'invalid mobile number' })
  @ValidateIf((o) => !o.email)
  @Type(() => MobileDto)
  readonly mobile: MobileDto;

  @ApiProperty({
    description: 'Password reset verification code',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly verificationCode: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

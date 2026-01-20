import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from '@nestjs/class-validator';
import { Transform } from 'class-transformer';

export class SocialLoginDto {
  @ApiProperty({
    description: 'User email address from social provider',
    example: 'user@gmail.com',
  })
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Profile type',
    example: 'user',
    enum: ['user', 'merchant'],
  })
  @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  readonly profileType: string;

  @ApiProperty({
    description: 'Social provider user ID',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  readonly socialId: string;

  @ApiProperty({
    description: 'OAuth access token from social provider',
    example: 'ya29.a0AfH6SMB...',
  })
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
}

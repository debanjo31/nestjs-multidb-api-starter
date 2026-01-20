import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, ValidateIf, ValidateNested } from '@nestjs/class-validator';
import { Transform, Type } from 'class-transformer';
import { MobileDto } from '../mobile.dto';

export class SendVerificationDto {
  @ApiPropertyOptional({
    description: 'User email address (required if mobile not provided)',
    example: 'user@example.com',
  })
  @Transform((s) => String(s.value).trim().toLowerCase())
  @ValidateIf((o) => !o.mobile)
  @IsEmail()
  @IsNotEmpty()
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
    description: 'Verification type',
    example: 'email',
    enum: ['mobile', 'email', 'resetPassword'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['mobile', 'email', 'resetPassword'])
  readonly type: string;
}

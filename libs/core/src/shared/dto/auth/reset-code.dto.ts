import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { Transform, Type } from 'class-transformer';
import { MobileDto } from '../mobile.dto';

export class ResetCodeDto {
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
}

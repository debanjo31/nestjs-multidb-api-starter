import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { MobileDto } from '../mobile.dto';

export class VerifyMobileDto {
  @ApiProperty({
    description: 'Mobile number details',
    type: () => MobileDto,
  })
  @IsNotEmpty()
  @ValidateNested({ message: 'invalid mobile number' })
  @Type(() => MobileDto)
  readonly mobile: MobileDto;

  @ApiProperty({
    description: 'Verification code sent to mobile',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  readonly verificationCode: string;
}

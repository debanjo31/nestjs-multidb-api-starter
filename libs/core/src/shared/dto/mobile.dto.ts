import { ApiProperty } from '@nestjs/swagger';
import { IsString } from '@nestjs/class-validator';

export class MobileDto {
  @ApiProperty({
    description: 'Mobile phone number',
    example: '8012345678',
  })
  @IsString()
  readonly mobile: string;

  @ApiProperty({
    description: 'ISO country code',
    example: 'NG',
  })
  @IsString()
  readonly isoCode: string;
}

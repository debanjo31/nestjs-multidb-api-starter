import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from '@nestjs/class-validator';

export class AdminUpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Admin first name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Admin last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

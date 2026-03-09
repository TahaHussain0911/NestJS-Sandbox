import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of user',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    description: 'New password of user',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

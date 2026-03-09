import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DTOTrim } from 'src/common/utils/helper';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the category',
    maxLength: 100,
  })
  @Transform(DTOTrim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Devices and gadgets including phones, laptops, and accessories',
    description: 'A brief description of the category',
    maxLength: 255,
  })
  @Transform(DTOTrim)
  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/electronics.png',
    description: 'URL of the category image',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if the category is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

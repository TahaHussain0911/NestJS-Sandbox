import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DTOTrim } from 'src/common/utils/helper';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
    maxLength: 200,
  })
  @Transform(DTOTrim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality wireless headphoneswith noise cancellation',
    maxLength: 400,
  })
  @Transform(DTOTrim)
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description: string;

  @ApiProperty({
    description: 'Product Price in USD',
    example: 99.99,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 100,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Stock keeping Unit (Sku) -unique identifier',
    example: 'WH-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, { message: 'Field cannot contain spaces' })
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({
    description: 'Product image url',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Indicates if the product is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
    required: true,
  })
  @IsString()
  categoryId: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DTOBoolean, DTOTrim } from 'src/common/utils/helper';

export class QueryProductDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @Transform(DTOBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search term to filter products by name or description',
    example: 'Headphones',
  })
  @Transform(DTOTrim)
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter products by category id',
    example: '550e484-ere8458454-45erer4844858',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page limit for pagination',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(10)
  limit?: number;
}

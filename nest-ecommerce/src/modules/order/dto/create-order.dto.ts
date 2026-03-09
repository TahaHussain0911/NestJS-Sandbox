import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DTOTrim } from 'src/common/utils/helper';

class OrderItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 49.99,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
  })
  @Type(() => OrderItemDto)
  @IsArray()
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @ApiPropertyOptional()
  @Transform(DTOTrim)
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

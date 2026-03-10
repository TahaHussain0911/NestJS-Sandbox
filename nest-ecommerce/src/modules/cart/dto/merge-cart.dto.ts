import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddToCartDto } from './add-to-cart.dto';

export class MergeCartDto {
  @ApiProperty({
    type: [AddToCartDto],
  })
  @Type(() => AddToCartDto)
  @IsArray()
  @ValidateNested({ each: true })
  items: AddToCartDto[];
}

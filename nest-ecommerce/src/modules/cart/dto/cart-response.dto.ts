import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from 'src/modules/product/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({
    description: 'Cart Item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Cart ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  cartId: string | null;

  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product details',
    type: () => ProductResponseDto,
  })
  product: Partial<ProductResponseDto>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'Cart ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'Cart items',
    type: [CartItemResponseDto],
  })
  cartItems: CartItemResponseDto[];

  @ApiProperty({
    description: 'Total cart value',
    example: 299.97,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Total items count',
    example: 3,
  })
  totalItems: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

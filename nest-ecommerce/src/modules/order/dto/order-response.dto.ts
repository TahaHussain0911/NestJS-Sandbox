import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'Returned data',
    type: Object,
  })
  data: T;

  @ApiPropertyOptional({
    description: 'Optional message',
    nullable: true,
  })
  message: string;
}

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  shippingAddress: string | null;

  @ApiProperty({
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedOrderResponseDto {
  data: OrderResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

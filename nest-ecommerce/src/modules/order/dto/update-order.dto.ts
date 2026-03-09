import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum OrderStatusWithoutPendingCancelled {
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export class UpdateOrderDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(OrderStatusWithoutPendingCancelled)
  status?: OrderStatusWithoutPendingCancelled;
}

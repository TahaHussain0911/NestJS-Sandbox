import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentIntentResponseDto {
  @ApiProperty({
    example: 'pi_165465465',
    description: 'Stripe client secret for payment confirmation',
  })
  clientSecret: string;

  @ApiProperty({
    example: '2165465-454-sds4s854d65',
    description: 'Payment ID in database',
  })
  paymentId: string;
}

export class PaymentResponseDto {
  @ApiProperty({
    example: '1215645s454sdosd4s-454sd',
  })
  id: string;

  @ApiProperty({
    example: 'order-123',
  })
  orderId: string;

  @ApiProperty({
    example: 99.99,
  })
  amount: number;

  @ApiProperty({
    example: 'user-456',
  })
  userId: string;

  @ApiProperty({
    example: 'usd',
  })
  currency: string;

  @ApiProperty({
    example: PaymentStatus.COMPLETED,
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiProperty({
    example: 'STRIPE',
    nullable: true,
  })
  paymentMethod: string | null;

  @ApiProperty({
    example: 'pi_1213546846',
    nullable: true,
  })
  transactionId: string | null;

  @ApiProperty({})
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaymentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: PaymentResponseDto,
  })
  data: PaymentResponseDto;

  @ApiPropertyOptional({
    example: 'Payment retrieved successfully',
  })
  message?: string;
}

export class CreatePaymentIntentApiResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    type: CreatePaymentIntentResponseDto,
  })
  data: CreatePaymentIntentResponseDto;

  @ApiPropertyOptional({
    example: 'Payment intent created successfully',
  })
  message?: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}

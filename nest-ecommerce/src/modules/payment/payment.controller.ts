import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  CreatePaymentIntentApiResponseDto,
  PaymentApiResponseDto,
} from './dto/payment-response.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@ApiTags('Payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({
    summary: 'create payment intent for an order',
  })
  @ApiCreatedResponse({
    description: 'Payment intent created successfully',
    type: CreatePaymentIntentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data or order not found',
  })
  @Post('create-intent')
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @GetUser('id') userId: string,
  ): Promise<CreatePaymentIntentApiResponseDto> {
    return await this.paymentService.createPaymentIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm Payment intent for an order',
  })
  @ApiOkResponse({
    description: 'Payment confirmed successfully',
    type: PaymentApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment not found or already completed',
  })
  async confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @GetUser('id') userId: string,
  ): Promise<PaymentApiResponseDto> {
    return await this.paymentService.confirmPayment(userId, confirmPaymentDto);
  }
}

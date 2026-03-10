import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import {
  CreatePaymentIntentApiResponseDto,
  PaymentApiResponseDto,
  PaymentResponseDto,
} from './dto/payment-response.dto';
import Stripe from 'stripe';
import { OrderStatus, Payment, PaymentStatus } from '@prisma/client';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    });
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<CreatePaymentIntentApiResponseDto> {
    const { orderId, amount, currency = 'usd' } = createPaymentIntentDto;

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('payment already complted  for this order');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { orderId, userId },
    });
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        paymentMethod: 'STRIPE',
        transactionId: paymentIntent.id,
      },
    });
    return {
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret!,
        paymentId: payment.id,
      },
    };
  }

  async confirmPayment(
    userId: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<PaymentApiResponseDto> {
    const { paymentIntentId, orderId } = confirmPaymentDto;
    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId,
        userId,
        transactionId: paymentIntentId,
      },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }
    const [updatedPayment, updatedOrder] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
        },
      }),
      this.prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: OrderStatus.PROCESSING,
        },
      }),
    ]);
    if (updatedOrder.cartId) {
      await this.prisma.cart.update({
        where: { id: updatedOrder.cartId },
        data: {
          checkedOut: true,
        },
      });
    }
    return {
      success: true,
      message: 'Payment confirmed successfully',
      data: this.mapToPaymentResponse(updatedPayment),
    };
  }
  private mapToPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      status: payment.status,
      amount: Number(payment.amount),
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}

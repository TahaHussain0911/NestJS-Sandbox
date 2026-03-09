import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  Prisma,
  Product,
  User,
} from '@prisma/client';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const { items, shippingAddress } = createOrderDto;
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: {
          id: item.productId,
        },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available ${product.stock}. Requested ${item.quantity}`,
        );
      }
    }
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const latestCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        checkedOut: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          status: OrderStatus.PENDING,
          totalAmount: total,
          shippingAddress,
          userId,
          cartId: latestCart?.id,
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      return newOrder;
    });
    return this.wrap(order);
  }

  async findAllForAdmin(
    queryOrderDto: QueryOrderDto,
  ): Promise<PaginatedOrderResponseDto> {
    const { page = 1, limit = 10, search, status } = queryOrderDto;
    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          orderNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders.map((order) => this.map(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(
    userId: string,
    queryOrderDto: QueryOrderDto,
  ): Promise<PaginatedOrderResponseDto> {
    const { page = 1, limit = 10, search, status } = queryOrderDto;
    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        {
          id: {
            contains: search,
            mode: 'insensitive',
          },
          orderNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {},
      ];
    }
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders.map((order) => this.map(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<OrderResponseDto> {
    const where: Prisma.OrderWhereInput = {
      id,
    };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.map(order);
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<OrderResponseDto> {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({ where });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });
    return this.map(updatedOrder);
  }

  async cancel(
    id: string,
    userId?: string,
  ): Promise<OrderApiResponseDto<OrderResponseDto>> {
    const where: Prisma.OrderWhereInput = { id };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: {
        orderItems: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Only pending orders can be cancelled`);
    }
    const cancelled = await this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
      return tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });
    });
    return this.wrap(cancelled, 'Order cancelled successfully!');
  }

  private wrap(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
    message: string = 'Order created successfully',
  ): OrderApiResponseDto<OrderResponseDto> {
    return {
      success: true,
      message,
      data: this.map(order),
    };
  }

  private map(
    order: Order & {
      orderItems: (OrderItem & { product: Product })[];
      user: User;
    },
  ): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: Number(order.totalAmount),
      shippingAddress: order.shippingAddress ?? '',
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      ...(order.user && {
        userEmail: order.user.email,
        userName:
          `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
      }),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

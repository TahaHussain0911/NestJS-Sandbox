import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ModerateThrottle,
  RelaxedThrottle,
} from 'src/common/decorators/custom-throttler.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  OrderApiResponseDto,
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/order-response.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Create a new order',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiNotFoundResponse({
    description: 'Cart not found or empty',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests - rate limit exceeded',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.orderService.create(createOrderDto, userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get all orders',
  })
  @ApiOkResponse({
    description: 'List of orders',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(OrderResponseDto),
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    type: 'Forbidden',
  })
  async findAllForAdmin(@Query() queryOrderDto: QueryOrderDto) {
    return await this.orderService.findAllForAdmin(queryOrderDto);
  }

  @Get()
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get all orders',
  })
  @ApiQuery({ type: QueryOrderDto })
  @ApiOkResponse({
    description: 'List of user orders',
    type: PaginatedOrderResponseDto,
  })
  async findAll(@GetUser('id') userId: string, queryOrderDto: QueryOrderDto) {
    return await this.orderService.findAll(userId, queryOrderDto);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @RelaxedThrottle()
  @ApiOperation({
    summary: '[ADMIN]: Get order by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async findOneAdmin(@Param('id') id: string) {
    return await this.orderService.findOne(id);
  }

  @Get(':id')
  @RelaxedThrottle()
  @ApiOperation({
    summary: 'Get an order by ID for current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(id);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    summary: '[Admin] Update any order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id')
  @ModerateThrottle()
  @ApiOperation({
    summary: 'Update your own order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser('id') userId: string,
  ) {
    return await this.orderService.update(id, updateOrderDto, userId);
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ModerateThrottle()
  @ApiOperation({
    description: 'Delete any order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async cancelAdmin(@Param('id') id: string) {
    return await this.orderService.cancel(id);
  }

  @Delete(':id')
  @ModerateThrottle()
  @ApiOperation({
    description: 'Cancel your own order',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
  })
  @ApiOkResponse({
    description: 'Order cancelled',
    type: OrderApiResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required',
  })
  async cancel(@Param('id') id: string, @GetUser('id') userId: string) {
    return await this.orderService.cancel(id, userId);
  }
}

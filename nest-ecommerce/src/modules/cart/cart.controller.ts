import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CartResponseDto } from './dto/cart-response.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user cart',
  })
  @ApiOkResponse({
    description: 'User Cart',
    type: CartResponseDto,
  })
  async getCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add Item to cart',
  })
  @ApiBody({ type: AddToCartDto })
  @ApiOkResponse({
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({
    description: 'Product unavailable or insufficient stock',
  })
  async addToCart(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch('items/:id')
  @ApiOperation({
    summary: 'Update an item in cart',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({
    description: 'Updated Cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart item not found',
  })
  @ApiBadRequestResponse({
    description: 'Product insufficient stock',
  })
  async updateCartItem(
    @GetUser('id') userId: string,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.updateCartItem(
      userId,
      cartItemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from cart' })
  @ApiParam({
    name: 'id',
    description: 'Cart item ID',
  })
  @ApiOkResponse({
    description: 'Item removed from cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Cart item not found',
  })
  async deleteCartItem(
    @GetUser('id') userId: string,
    @Param('id') cartItemId: string,
  ): Promise<CartResponseDto> {
    return await this.cartService.removeCartItem(userId, cartItemId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Clear all cart items',
  })
  @ApiOkResponse({
    description: 'All items removed from cart',
    type: CartResponseDto,
  })
  async clearCart(@GetUser('id') userId: string): Promise<CartResponseDto> {
    return this.cartService.clearCart(userId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart into user cart' })
  @ApiBody({ type: MergeCartDto })
  @ApiOkResponse({
    description: 'Merged Cart',
    type: CartResponseDto,
  })
  async mergeCart(
    @GetUser('id') userId: string,
    @Body() mergeCartDto: MergeCartDto,
  ): Promise<CartResponseDto> {
    return await this.cartService.mergeCart(userId, mergeCartDto);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { Cart, CartItem, Product } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string): Promise<CartResponseDto> {
    return this.getOrCreateActiveCart(userId);
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const { productId, quantity } = addToCartDto;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available ${product.stock}, Request ${quantity}`,
      );
    }
    const cart = await this.getOrCreateActiveCart(userId);
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Available ${product.stock}, Request ${newQuantity}`,
        );
      }
      await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          quantity,
          productId,
        },
      });
    }
    return this.getOrCreateActiveCart(userId);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
      },
      include: {
        cart: true,
        product: true,
      },
    });
    if (!cartItem || cartItem.cart?.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    const { quantity } = updateCartItemDto;
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient product stock. Available ${cartItem.product.stock}, Requested ${quantity}`,
      );
    }
    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
      },
    });
    return this.getOrCreateActiveCart(userId);
  }

  async removeCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<CartResponseDto> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
      },
      include: {
        cart: true,
      },
    });
    if (!cartItem || cartItem.cart?.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });
    return this.getOrCreateActiveCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId,
      },
    });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
    }
    return this.getOrCreateActiveCart(userId);
  }

  async mergeCart(
    userId: string,
    mergeCartDto: MergeCartDto,
  ): Promise<CartResponseDto> {
    const { items } = mergeCartDto;
    if (!items || items.length === 0) {
      return this.getOrCreateActiveCart(userId);
    }
    for (const item of items) {
      try {
        await this.addToCart(userId, item);
      } catch (err) {
        console.warn(
          `[CartService] Failed to merge item ${item.productId}:`,
          err.message,
        );
      }
    }
    return this.getOrCreateActiveCart(userId);
  }

  private async getOrCreateActiveCart(
    userId: string,
  ): Promise<CartResponseDto> {
    let cart = await this.prisma.cart.findFirst({
      where: {
        userId,
        checkedOut: false,
      },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    return this.formatCart(cart);
  }

  private formatCart(
    cart: Cart & { cartItems: (CartItem & { product: Product })[] },
  ): CartResponseDto {
    const cartItems = cart.cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      cartId: item.cartId,
      productId: item.product.id,
      product: { ...item.product, price: Number(item.product.price) },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return {
      id: cart.id,
      userId: cart.userId,
      cartItems,
      totalPrice,
      totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}

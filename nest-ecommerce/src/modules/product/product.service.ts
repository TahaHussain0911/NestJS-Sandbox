import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductResponseDto,
  ProductsAndMetaDto,
} from './dto/product-response.dto';
import { Category, Prisma, Product } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const { categoryId, sku, price, ...rest } = createProductDto;
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: sku },
    });
    if (existingSku) {
      throw new ConflictException(`Product with SKU ${sku} already exists`);
    }
    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      throw new BadRequestException('Category doesnot exists');
    }
    const product = await this.prisma.product.create({
      data: {
        ...rest,
        categoryId,
        sku,
        price: new Prisma.Decimal(price),
      },
      include: {
        category: true,
      },
    });
    return this.formatProduct(product);
  }

  async findAll(queryDto: QueryProductDto): Promise<ProductsAndMetaDto> {
    const { category, isActive, search, page = 1, limit = 10 } = queryDto;
    const where: Prisma.ProductWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }
    if (category) {
      where.categoryId = category;
    }

    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });
    return {
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.formatProduct(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }
    const { categoryId, sku, price, ...rest } = updateProductDto;
    const updatedData: any = {
      ...rest,
    };

    if (sku && existingProduct.sku !== sku) {
      const skuTaken = await this.prisma.product.findUnique({ where: { sku } });
      if (skuTaken) {
        throw new ConflictException(`Product with sku ${sku} already exists`);
      }
      updatedData.sku = sku;
    }
    if (price !== undefined) {
      updatedData.price = new Prisma.Decimal(price);
    }
    if (categoryId && categoryId !== existingProduct.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        throw new BadRequestException('Product category doesnot exists');
      }
      updatedData.categoryId = categoryId;
    }
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updatedData,
      include: {
        category: true,
      },
    });
    return this.formatProduct(updatedProduct);
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const newStock = product.stock + quantity; //  if quantity -ve then + - = - if +ve  then + + = +
    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
      },
      include: {
        category: true,
      },
    });
    return this.formatProduct(updatedProduct);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'Cannot delete product that is part of existing orders. Consider marking it as inactive only',
      );
    }
    await this.prisma.product.delete({ where: { id } });
    return {
      message: 'Product deleted successfully',
    };
  }

  private formatProduct(
    product: Product & { category: Category },
  ): ProductResponseDto {
    return {
      ...product,
      category: product.category.name,
      price: Number(product.price),
    };
  }
}

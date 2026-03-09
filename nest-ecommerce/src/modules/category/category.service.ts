import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';
import { createSlug } from 'src/common/utils/helper';
import { Category, Prisma } from '@prisma/client';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { name, ...rest } = createCategoryDto;
    const categorySlug = createSlug(name);
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        slug: categorySlug,
      },
    });
    if (existingCategory) {
      throw new ConflictException(
        `Category with this slug already exists ${categorySlug}`,
      );
    }
    const category = await this.prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        ...rest,
      },
    });
    return this.formatCategory(category, 0);
  }

  async findAll(queryDto: QueryCategoryDto): Promise<{
    data: CategoryResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { isActive, search, page = 1, limit = 10 } = queryDto;
    const where: Prisma.CategoryWhereInput = {};
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
    const total = await this.prisma.category.count({ where });
    const categories = await this.prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return {
      data: categories.map((category) =>
        this.formatCategory(category, category._count.products),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(categoryId: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    console.log(category,'category')
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.formatCategory(category, category._count.products);
  }

  async findOneBySlug(categorySlug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: categorySlug,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.formatCategory(category, category._count.products);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    console.log(updateCategoryDto,'updateCategoryDto')
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const updatedCategory = await this.prisma.category.update({
      where: {
        id,
      },
      data: updateCategoryDto,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    return this.formatCategory(
      updatedCategory,
      updatedCategory._count.products,
    );
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category._count.products > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Remove or reassign first',
      );
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: `Category deleted successfully` };
  }

  private formatCategory(
    category: Category,
    productCount: number,
  ): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      productCount,
    };
  }
}

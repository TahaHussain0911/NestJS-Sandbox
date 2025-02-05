import { IsEnum, IsNotEmpty, Min, MinLength } from 'class-validator';
import { Category } from '../schemas/book.schema';

export class CreateBookDto {
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsNotEmpty({ message: 'Author name is required' })
  @MinLength(3, { message: 'Author name must be at least 3 characters long' })
  author: string;

  @IsNotEmpty({ message: 'Price is required' })
  @Min(1, { message: 'Price must be greater than 0' })
  price: number;

  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(Category, { message: 'Invalid category selected' })
  category: Category;
}

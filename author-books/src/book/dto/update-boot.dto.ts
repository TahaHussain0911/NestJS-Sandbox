import {
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Category } from '../schemas/book.schema';
import { Auth } from 'src/auth/schemas/auth.schema';

export class UpdateBootDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Author name must be at least 3 characters long' })
  author: string;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @IsEnum(Category, { message: 'Invalid category selected' })
  category: Category;

  @IsEmpty({ message: 'User id cannot be passed!' })
  readonly user: Auth;
}

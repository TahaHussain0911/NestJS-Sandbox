import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

// PartialType makes the fields optional at swagger level
// as well as typescript level
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

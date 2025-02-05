import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEnum,
  IsNotEmpty,
  IsPositive,
  Min,
  MinLength,
} from 'class-validator';

export enum Category {
  ADVENTURE = 'Adventure',
  CLASSICS = 'Classics',
  CRIME = 'Crime',
  FANTASY = 'Fantasy',
}

@Schema({
  timestamps: true,
})
export class Book {
  @Prop({ unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  author: string;

  @Prop()
  price: number;

  @Prop()
  category: Category;
}
export const BookSchema = SchemaFactory.createForClass(Book);

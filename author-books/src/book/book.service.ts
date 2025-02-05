import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Book } from './schemas/book.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: mongoose.Model<Book>,
  ) {}
  async findAll(query: ExpressQuery): Promise<Book[]> {
    const { search, page = '1', limit = '10' } = query;
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    let searchParams = {};
    if (search) {
      searchParams = {
        title: {
          $regex: search,
          $options: 'i',
        },
      };
    }
    const books = await this.bookModel
      .find(searchParams)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);
    return books;
  }
  async create(book: Book): Promise<Book> {
    return this.bookModel.create(book);
  }
  async findById(id: string): Promise<Book | null> {
    const foundBook = await this.bookModel.findById(id);
    if (!foundBook) {
      throw new NotFoundException('Book not found');
    }
    return foundBook;
  }
  async updateById(id: string, book: Book): Promise<Book | null> {
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, book, {
      new: true,
      runValidators: true,
    });
    if (!updatedBook) {
      throw new NotFoundException('Book not found!');
    }
    return updatedBook;
  }
  async deleteById(id: string): Promise<Book | null> {
    const deletedBook = await this.bookModel.findByIdAndDelete(id);
    if (!deletedBook) {
      throw new NotFoundException('Book not found');
    }
    return deletedBook;
  }
}

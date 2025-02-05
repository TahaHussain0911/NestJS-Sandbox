import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './schemas/book.schema';
import { Query as QueryParams } from 'express-serve-static-core';
import { UpdateBootDto } from './dto/update-boot.dto';
import { ValidateMongoId } from './pipes/validate-mongo-id.pipe';
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Get()
  getBooks(@Query() query: QueryParams): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Post()
  createBook(@Body() book: CreateBookDto): Promise<Book> {
    return this.bookService.create(book);
  }

  @Get('/:id')
  getSingleBook(
    @Param('id', ValidateMongoId) id: string,
  ): Promise<Book | null> {
    return this.bookService.findById(id);
  }

  @Patch('/:id')
  updateBook(
    @Param('id', ValidateMongoId) id: string,
    @Body() book: UpdateBootDto,
  ): Promise<Book | null> {
    return this.bookService.updateById(id, book);
  }

  @Delete('/:id')
  deleteBook(@Param('id', ValidateMongoId) id: string) {
    return this.bookService.deleteById(id);
  }
}

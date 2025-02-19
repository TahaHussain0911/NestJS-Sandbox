import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Query as QueryParams } from 'express-serve-static-core';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBootDto } from './dto/update-boot.dto';
import { ValidateMongoId } from './pipes/validate-mongo-id.pipe';
import { Book } from './schemas/book.schema';
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Get()
  // @Roles( Role.Admin)
  @UseGuards(AuthGuard())
  getBooks(@Query() query: QueryParams): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  createBook(@Body() book: CreateBookDto, @Req() req): Promise<Book> {
    return this.bookService.create(book, req.user);
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

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNotesDto } from './dtos/create-notes.dtos';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAllNotes() {
    return this.notesService.find();
  }

  @Get('/:id')
  async getSingleNote(@Param('id') id: string) {
    const note = await this.notesService.findOne(id);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  @Post()
  createNote(@Body() body: CreateNotesDto) {
    return this.notesService.create(body.note);
  }

  @Patch('/:id')
  async updateNote(@Param('id') id: string, @Body() body: CreateNotesDto) {
    const note = await this.notesService.findByIdAndUpdate(id, body.note);

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return { note, message: 'Note Updated' };
  }

  @Delete('/:id')
  async deleteNote(@Param('id') id: string) {
    const note = await this.notesService.findByIdAndDelete(id);
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return { note, message: 'Note Deleted' };
  }
}

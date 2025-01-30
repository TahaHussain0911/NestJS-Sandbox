import { Injectable } from '@nestjs/common';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepo: NotesRepository) {}
  find() {
    return this.notesRepo.find();
  }
  findOne(id: string) {
    return this.notesRepo.findOne(id);
  }
  create(note: string) {
    return this.notesRepo.create(note);
  }
  findByIdAndUpdate(id: string, note: string) {
    return this.notesRepo.findByIdAndUpdate(id, note);
  }
  findByIdAndDelete(id: string) {
    return this.notesRepo.findByIdAndDelete(id);
  }
}

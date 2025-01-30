import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { Note, Notes } from './interfaces/notes.interface';

@Injectable()
export class NotesRepository {
  private readonly filePath = 'repository/notes.json';
  private async readNotes(): Promise<Notes> {
    const notes = await readFile(this.filePath, 'utf8');
    return JSON.parse(notes);
  }
  private async writeNotes(notes: Notes): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(notes));
  }
  async find(): Promise<Notes> {
    return this.readNotes();
  }
  async findOne(id: string): Promise<Note | undefined> {
    const { notes } = await this.readNotes();
    const singleNote = notes.find((note) => note?._id === +id);
    return singleNote;
  }
  async create(note: string): Promise<Note> {
    const { notes, totalCount } = await this.readNotes();
    const id = totalCount + 1;
    const newNote: Note = {
      note,
      _id: id,
    };
    notes.push(newNote);
    await this.writeNotes({ notes, totalCount: totalCount + 1 });
    return newNote;
  }
  async findByIdAndUpdate(id: string, note: string): Promise<Note | undefined> {
    const { notes, totalCount } = await this.readNotes();
    const noteIndex = notes.findIndex((note) => note?._id === +id);
    if (noteIndex === -1) {
      return undefined;
    }
    const updatedNote: Note = {
      _id: +id,
      note,
    };
    notes.splice(noteIndex, 1, updatedNote);
    await this.writeNotes({ notes, totalCount });
    return updatedNote;
  }
  async findByIdAndDelete(id: string): Promise<Note | undefined> {
    const { notes, totalCount } = await this.readNotes();
    const noteIndex = notes.findIndex((note) => note?._id === +id);
    if (noteIndex === -1) return undefined;
    const [deletedNote] = notes.splice(noteIndex, 1);
    await this.writeNotes({ notes, totalCount });
    return deletedNote;
  }
}

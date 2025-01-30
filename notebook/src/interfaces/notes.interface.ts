interface Note {
  note: string;
  _id: Number;
}

interface Notes {
  notes: Note[];
  totalCount: number;
}
export { Notes, Note };

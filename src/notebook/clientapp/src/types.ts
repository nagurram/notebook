export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}

export interface NotesResponse {
  data: Note[];
  message?: string;
}

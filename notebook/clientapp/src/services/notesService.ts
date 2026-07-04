import type { Note, CreateNoteDto, UpdateNoteDto } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5012';
const NOTES_ENDPOINT = `${API_BASE_URL}/bff/notes`;

export const notesService = {
  /**
   * Fetch all notes from the API
   */
  async getAllNotes(): Promise<Note[]> {
    try {
      const response = await fetch(NOTES_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.statusText}`);
      }
      const notes = await response.json();
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  /**
   * Get a single note by ID
   */
  async getNoteById(id: number): Promise<Note> {
    try {
      const response = await fetch(`${NOTES_ENDPOINT}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch note: ${response.statusText}`);
      }
      const note = await response.json();
      return note;
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteDto): Promise<Note> {
    try {
      console.debug('notesService.createNote - payload:', noteData);
      const response = await fetch(NOTES_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      const responseText = await response.text();
      let parsedResponse: any = responseText;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        // response wasn't JSON, keep raw text
      }

      console.debug('notesService.createNote - response:', {
        status: response.status,
        ok: response.ok,
        body: parsedResponse,
      });

      if (!response.ok) {
        const message = parsedResponse?.message || parsedResponse || response.statusText;
        throw new Error(`Failed to create note: ${message}`);
      }

      return parsedResponse as Note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * Update an existing note
   */
  async updateNote(id: number, noteData: UpdateNoteDto): Promise<Note> {
    try {
      const response = await fetch(`${NOTES_ENDPOINT}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.statusText}`);
      }

      const updatedNote = await response.json();
      return updatedNote;
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a note
   */
  async deleteNote(id: number): Promise<void> {
    try {
      const response = await fetch(`${NOTES_ENDPOINT}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      throw error;
    }
  },
};

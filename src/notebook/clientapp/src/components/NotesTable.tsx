import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Note } from '../types';
import { notesService } from '../services/notesService';
import { AddNoteDialog } from './AddNoteDialog';

export const NotesTable = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesService.getAllNotes();
      setNotes(data);
      setFilteredNotes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load notes'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filter notes based on search term
  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerSearchTerm) ||
        note.content.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredNotes(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchTerm, notes]);

  const handleAddNote = () => {
    setEditingNote(null);
    setAddDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setAddDialogOpen(true);
  };

  const handleNoteAdded = async (note: Note) => {
    // Update the list with the new/updated note
    const exists = notes.find((n) => n.id === note.id);
    if (exists) {
      setNotes(notes.map((n) => (n.id === note.id ? note : n)));
    } else {
      setNotes([note, ...notes]);
    }
    setAddDialogOpen(false);
    setEditingNote(null);
  };

  const handleDeleteClick = (note: Note) => {
    setDeleteTarget(note);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await notesService.deleteNote(deleteTarget.id);
      setNotes(notes.filter((n) => n.id !== deleteTarget.id));
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete note'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const paginatedNotes = filteredNotes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          placeholder="Search notes by title or content..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300, flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNote}
          sx={{ whiteSpace: 'nowrap' }}
        >
          + Add Note
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {filteredNotes.length === 0 ? (
        <Alert severity="info">
          {notes.length === 0
            ? 'No notes yet. Create your first note!'
            : 'No notes match your search.'}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Content</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Updated</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedNotes.map((note) => (
                  <TableRow key={note.id} hover>
                    <TableCell sx={{ maxWidth: 200, fontWeight: 500 }}>
                      {note.title}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {note.content}
                      </div>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {formatDate(note.createdAt)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {formatDate(note.updatedAt)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditNote(note)}
                        title="Edit note"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(note)}
                        title="Delete note"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredNotes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Add/Edit Note Dialog */}
      <AddNoteDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditingNote(null);
        }}
        onNoteAdded={handleNoteAdded}
        editingNote={editingNote}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleting && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deleteTarget?.title}"? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

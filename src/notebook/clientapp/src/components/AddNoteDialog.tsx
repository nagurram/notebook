import { useState, useEffect, useRef } from 'react';
import type { ClipboardEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import 'react-quill-new/dist/quill.snow.css';
import type { Note, CreateNoteDto, UpdateNoteDto } from '../types';
import { notesService } from '../services/notesService';

interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onNoteAdded: (note: Note) => void;
  editingNote?: Note | null;
}

export const AddNoteDialog = ({
  open,
  onClose,
  onNoteAdded,
  editingNote = null,
}: AddNoteDialogProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const handleImagePaste = (event: ClipboardEvent<any>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const ta = taRef.current;
          if (!ta) return;
          const start = ta.selectionStart ?? ta.value.length;
          const end = ta.selectionEnd ?? ta.value.length;
          const insert = `![](${dataUrl})`;
          const newVal = ta.value.substring(0, start) + insert + ta.value.substring(end);
          setContent(newVal);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + insert.length;
          });
        };
        reader.readAsDataURL(file);
        event.preventDefault();
        break;
      }
    }
  };

  useEffect(() => {
    if (open) {
      if (editingNote) {
        setTitle(editingNote.title);
        setContent(editingNote.content);
      } else {
        setTitle('');
        setContent('');
      }
      setError(null);
    }
  }, [open, editingNote]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    console.debug('AddNoteDialog.handleSubmit - submitting', { title, content, editingNote });
    setLoading(true);
    setError(null);

    try {
      let result: Note;

      if (editingNote) {
        const updateData: UpdateNoteDto = { title, content };
        result = await notesService.updateNote(editingNote.id, updateData);
      } else {
        const createData: CreateNoteDto = { title, content };
        result = await notesService.createNote(createData);
      }

      onNoteAdded(result);
      setTitle('');
      setContent('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setContent('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: '80vw',
            maxWidth: '80vw',
            height: '80vh',
            maxHeight: '80vh',
          },
        },
      }}
    >
      <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
            minHeight: 'calc(80vh - 180px)',
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Title"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            variant="outlined"
            autoFocus
          />

          <Box sx={{ flexGrow: 1 }}>
            <textarea
              ref={taRef}
              onPaste={handleImagePaste}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '220px',
                height: '100%',
                fontSize: '1rem',
                padding: '12px',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.23)',
                boxSizing: 'border-box',
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !title.trim() || !content.trim()}>
          {loading ? 'Saving...' : editingNote ? 'Update' : 'Add Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

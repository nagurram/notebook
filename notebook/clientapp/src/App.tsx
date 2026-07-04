import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import { NotesTable } from './components/NotesTable';
import './App.css';

function App() {
  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📝 Notes App
          </Typography>
          <Typography variant="body2">
            Powered by React & .NET 8
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            My Notes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create, edit, and manage your notes. Use the search box to find notes by title or content.
          </Typography>
        </Box>

        <NotesTable />
      </Container>
    </>
  );
}

export default App;

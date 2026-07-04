# Full-Stack Notes App - Setup Guide

## Project Structure

```
notebook/
├── notebook/
│   ├── Controllers/           # API endpoints
│   │   └── NotesController.cs # /bff/notes CRUD endpoints
│   ├── Data/
│   │   └── NotesDbContext.cs  # EF Core DbContext
│   ├── Models/
│   │   └── Note.cs            # Note entity
│   ├── wwwroot/               # React build output (served by ASP.NET Core)
│   │   ├── index.html
│   │   ├── assets/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── Program.cs             # Main configuration
│   ├── appsettings.json       # Configuration (DB connection string)
│   └── notes.db               # SQLite database (auto-created)
└── clientapp/                 # React frontend source
	├── src/
	│   ├── components/        # React components
	│   │   ├── NotesTable.tsx
	│   │   └── AddNoteDialog.tsx
	│   ├── services/          # API service layer
	│   │   └── notesService.ts
	│   ├── types.ts           # TypeScript interfaces
	│   └── App.tsx
	├── vite.config.ts         # Outputs to ../wwwroot
	├── package.json
	└── .env                   # Environment config
```

## Running the Application

### Development Mode

#### Terminal 1 - Start .NET API:
```powershell
cd D:\Github\Repos\notebook\notebook
dotnet run
```
API runs on: https://localhost:5001 or http://localhost:5000

#### Terminal 2 - Start React Dev Server (Optional):
```powershell
cd D:\Github\Repos\notebook\notebook\clientapp
npm run dev
```
React dev server runs on: http://localhost:5173

When using the dev server, API calls go to http://localhost:5001 (configured in .env)

### Production Mode

#### Build React App:
```powershell
cd D:\Github\Repos\notebook\notebook\clientapp
npm run build
```
Output: React build files go to ../wwwroot/

#### Run .NET API (serves React):
```powershell
cd D:\Github\Repos\notebook\notebook
dotnet run
```
Access the full app at: https://localhost:5001 (or http://localhost:5000)

The .NET API serves:
- Static React app from wwwroot/ on all routes
- API endpoints at /bff/notes
- Swagger UI at /swagger/index.html (dev only)

## Key Features

### API Endpoints
- `GET /bff/notes` - Get all notes (sorted by UpdatedAt)
- `GET /bff/notes/{id}` - Get specific note
- `POST /bff/notes` - Create new note
- `PUT /bff/notes/{id}` - Update note
- `DELETE /bff/notes/{id}` - Delete note

### React Features
- **Notes Table**: Display all notes with title, content, timestamps
- **Search**: Filter notes by title or content in real-time
- **Pagination**: 5, 10, 25, 50 notes per page
- **Add Note**: Modal dialog to create new notes
- **Edit Note**: Click edit icon to modify existing notes
- **Delete Note**: Remove notes with confirmation dialog
- **Material-UI**: Professional UI components

### Configuration

#### API URL
Edit `clientapp/.env` or `clientapp/.env.local`:
```
VITE_API_URL=http://localhost:5001
```

#### Database
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Data Source=notes.db"
  }
}
```

## Development Workflow

### 1. Make Backend Changes
- Edit files in `notebook/` (C# files)
- Changes apply on next `dotnet run`

### 2. Make Frontend Changes
- Edit files in `clientapp/src/`
- Use `npm run dev` for hot reload (Vite HMR)
- Or run `npm run build` to update wwwroot

### 3. Full Stack Testing
- Run `npm run build` in clientapp
- Run `dotnet run` in notebook
- Access at https://localhost:5001

## Troubleshooting

### CORS Issues
- Dev mode: CORS enabled for http://localhost:3000 (for dev server)
- Prod mode: CORS disabled (React served directly from API)
- If getting CORS errors, ensure you're using the correct API URL

### Database Issues
- Delete `notes.db` and restart to reset database
- Run `dotnet ef database update` manually if needed

### Build Issues
- Clear `wwwroot` folder: `rm D:\Github\Repos\notebook\notebook\wwwroot\*`
- Run `npm run build` again in clientapp
- Ensure Node.js and npm are installed

### Port Already in Use
- Change port in `Properties/launchSettings.json`
- Or kill the process: `Get-Process | Where-Object {$_.ProcessName -like "dotnet*"} | Stop-Process`

## Environment Configuration

### Development (.env)
```
VITE_API_URL=http://localhost:5001
```

### Production
Set `VITE_API_URL` to your production API URL before building React app.

## Next Steps

1. **Start the API**: `dotnet run` from notebook folder
2. **Build React app**: `npm run build` from clientapp folder
3. **Access app**: Open https://localhost:5001 in browser
4. **Test endpoints**: Create, read, update, delete notes
5. **Check Swagger**: https://localhost:5001/swagger (dev only)

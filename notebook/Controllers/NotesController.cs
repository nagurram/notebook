using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using notebook.Data;
using notebook.Models;

namespace notebook.Controllers;

[ApiController]
[Route("bff/notes")]
public class NotesController : ControllerBase
{
    private readonly NotesDbContext _context;
    private readonly ILogger<NotesController> _logger;

    public NotesController(NotesDbContext context, ILogger<NotesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all notes
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
    {
        try
        {
            var notes = await _context.Notes.OrderByDescending(n => n.UpdatedAt).ToListAsync();
            return Ok(notes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notes");
            return StatusCode(500, new { message = "Error retrieving notes" });
        }
    }

    /// <summary>
    /// Get a specific note by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Note>> GetNote(int id)
    {
        try
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound(new { message = "Note not found" });
            }
            return Ok(note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving note with id {Id}", id);
            return StatusCode(500, new { message = "Error retrieving note" });
        }
    }

    /// <summary>
    /// Create a new note
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote([FromBody] CreateNoteDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var note = new Note
            {
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating note");
            return StatusCode(500, new { message = "Error creating note" });
        }
    }

    /// <summary>
    /// Update an existing note
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNote(int id, [FromBody] UpdateNoteDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound(new { message = "Note not found" });
            }

            note.Title = dto.Title ?? note.Title;
            note.Content = dto.Content ?? note.Content;
            note.UpdatedAt = DateTime.UtcNow;

            _context.Notes.Update(note);
            await _context.SaveChangesAsync();

            return Ok(note);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating note with id {Id}", id);
            return StatusCode(500, new { message = "Error updating note" });
        }
    }

    /// <summary>
    /// Delete a note
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        try
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound(new { message = "Note not found" });
            }

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting note with id {Id}", id);
            return StatusCode(500, new { message = "Error deleting note" });
        }
    }
}

/// <summary>
/// DTO for creating a new note
/// </summary>
public class CreateNoteDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// DTO for updating a note
/// </summary>
public class UpdateNoteDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
}

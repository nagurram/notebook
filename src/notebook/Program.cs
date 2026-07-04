using Microsoft.EntityFrameworkCore;
using notebook.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<NotesDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS - only in development for localhost:3000
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactLocalhost", policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:5012", "http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });
}

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations and create database if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NotesDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowReactLocalhost");
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseAuthorization();

// Map API controllers first
app.MapControllers();

// SPA fallback: serve index.html for any non-API, non-static requests
// This enables React Router to handle client-side routing
app.MapFallbackToFile("index.html");

app.Run();

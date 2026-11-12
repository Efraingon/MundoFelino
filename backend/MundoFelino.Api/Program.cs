using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Linq;
using MundoFelino.Api.Data;
using MundoFelino.Api.Services;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Servicio de IA con Google Gemini (versión gratuita) - ya configurado en GoogleGeminiChatService
builder.Services.AddScoped<KnowledgeRetriever>();

// Intentar cargar .env antes de construir la app
var envPath = Path.Combine(AppContext.BaseDirectory, ".env");
if (File.Exists(envPath))
{
    Environment.SetEnvironmentVariable("DEFAULT_CONNECTION", File.ReadAllText(envPath).Split('\n').FirstOrDefault(l => l.StartsWith("DEFAULT_CONNECTION="))?.Replace("DEFAULT_CONNECTION=", "") ?? "Host=localhost;Port=5432;Database=mundofelino;Username=mundofelino_app;Password=CAMBIAR");
}

// Intentar cargar .env.local del frontend para obtener credenciales de Supabase
var envLocalPath = Path.Combine(AppContext.BaseDirectory, "../..", "frontend/mundo-felino-web/.env.local");
if (File.Exists(envLocalPath))
{
    var envLocalContent = File.ReadAllText(envLocalPath);
    var supabaseUrl = envLocalContent.Split('\n').FirstOrDefault(l => l.StartsWith("VITE_SUPABASE_URL="))?.Replace("VITE_SUPABASE_URL=", "").Trim().Trim('"');
    var supabaseKey = envLocalContent.Split('\n').FirstOrDefault(l => l.StartsWith("VITE_SUPABASE_ANON_KEY="))?.Replace("VITE_SUPABASE_ANON_KEY=", "").Trim().Trim('"');
    
    if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
    {
        Environment.SetEnvironmentVariable("SUPABASE_URL", supabaseUrl);
        Environment.SetEnvironmentVariable("SUPABASE_ANON_KEY", supabaseKey);
    }
}

// Configurar conexión con Supabase o PostgreSQL local
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");
if (string.IsNullOrEmpty(connectionString))
{
    // Intentar obtener de variables de entorno SUPABASE
    var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL") ?? "";
    var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") ?? "";
    
    if (!string.IsNullOrEmpty(supabaseUrl) && !string.IsNullOrEmpty(supabaseKey))
    {
        // Conexión a Supabase (PostgreSQL remota)
        connectionString = $"Host={supabaseUrl.Split('/').Last()};Database=postgres;Username=postgres;Password={supabaseKey};SslMode=Prefer";
    }
}

// Fallback a datos simulados si no hay conexión de base de datos válida
string? dbType = null;
if (!string.IsNullOrEmpty(connectionString))
{
    if (connectionString.StartsWith("Host=") && !connectionString.Contains("mundofelino_app"))
    {
        dbType = "supabase";
    }
    else if (connectionString.Contains("mundofelino_app"))
    {
        dbType = "postgresql-local";
    }
}

builder.Services.AddDbContext<AppDbContext>(o =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        o.UseNpgsql(connectionString);
    }
});

// Inyectar indicador de tipo de base de datos en los controllers
builder.Services.AddSingleton(dbType ?? "");

var origins = builder.Configuration.GetSection("Frontend:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];
// Permitir CORS desde localhost (desarrollo) y Vercel (producción)
builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy
            .SetIsOriginAllowed(origin =>
                origin == "http://localhost:5173"
                    || origin == "http://localhost:5174"
                    || origin == "http://127.0.0.1:5173"
                    || origin == "http://127.0.0.1:5174"
                    || origin.EndsWith(".vercel.app")
                    || origins.Any(o => o == origin)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));
builder.Services.AddRateLimiter(o => o.AddFixedWindowLimiter("chat", x =>
{
    x.PermitLimit = 10;
    x.Window = TimeSpan.FromMinutes(1);
    x.QueueLimit = 0;
}));

var app = builder.Build();
app.UseCors("Frontend");
app.UseRateLimiter();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.MapGet("/api/v1/health", () => Results.Ok(new { status = "ok", service = "MundoFelino.Api" }));

// Endpoint para verificar tipo de conexión de base de datos
app.MapGet("/api/v1/db-status", () =>
{
    var dbType = app.Services.GetRequiredService<string>();
    return Results.Json(new { connection_type = dbType, message = dbType == "" ? "No connection configured, using mock data" : $"Connected to {dbType}" });
});

app.MapControllers();
app.Run();
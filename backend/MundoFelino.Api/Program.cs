using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using MundoFelino.Api.Data;
using MundoFelino.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<AiOptions>(builder.Configuration.GetSection("Ai"));
builder.Services.AddHttpClient<OllamaAiProvider>(client =>
    client.Timeout = TimeSpan.FromSeconds(builder.Configuration.GetValue<int?>("Ai:TimeoutSeconds") ?? 45));
builder.Services.AddScoped<IAiProvider>(sp =>
{
    var provider = sp.GetRequiredService<IConfiguration>()["Ai:Provider"] ?? "Ollama";
    return provider.Equals("Ollama", StringComparison.OrdinalIgnoreCase)
        ? sp.GetRequiredService<OllamaAiProvider>()
        : throw new InvalidOperationException($"AI provider '{provider}' is not registered.");
});
builder.Services.AddScoped<KnowledgeRetriever>();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var origins = builder.Configuration.GetSection("Frontend:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];
builder.Services.AddCors(o => o.AddPolicy("Frontend", p =>
    p.SetIsOriginAllowed(origin =>
    {
        if (string.IsNullOrEmpty(origin)) return false;
        if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
        {
            return uri.Host == "localhost"
                || uri.Host == "127.0.0.1"
                || uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)
                || origins.Contains(origin, StringComparer.OrdinalIgnoreCase);
        }
        return false;
    })
    .AllowAnyHeader()
    .AllowAnyMethod()));
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
app.MapControllers();
app.Run();

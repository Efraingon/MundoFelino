using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;

namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/articles")]
public sealed class ArticlesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPublished([FromQuery] string? category, CancellationToken ct)
    {
        var query = db.Articles.AsNoTracking().Where(a => a.Status == "Published");
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);
        var rows = await query.OrderByDescending(a => a.PublishedAt)
            .Select(a => new { a.Id, a.Title, a.Slug, a.Summary, a.Category, a.PublishedAt })
            .Take(100).ToListAsync(ct);
        return Ok(rows);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var row = await db.Articles.AsNoTracking()
            .Where(a => a.Slug == slug && a.Status == "Published")
            .Select(a => new { a.Id, a.Title, a.Slug, a.Summary, a.Content, a.Category, a.PublishedAt })
            .SingleOrDefaultAsync(ct);
        return row is null ? NotFound() : Ok(row);
    }
}

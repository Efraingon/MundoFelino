using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;

namespace MundoFelino.Api.Services;

public sealed record KnowledgeSource(string Title, string Slug, string Category);
public sealed record KnowledgeResult(string Context, IReadOnlyList<KnowledgeSource> Sources);

// Recuperación textual de demostración. Sustituir por búsqueda híbrida full-text + pgvector.
public sealed class KnowledgeRetriever(AppDbContext db)
{
    public async Task<KnowledgeResult> RetrieveAsync(string question, CancellationToken ct)
    {
        var terms = question.ToLowerInvariant()
            .Split([' ', ',', '.', ';', ':', '?', '!', '¿', '¡', '\n', '\r'],
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(t => t.Length >= 4).Distinct().Take(8).ToArray();
        if (terms.Length == 0) return new("No se encontraron fuentes específicas.", []);

        var docs = await db.Articles.AsNoTracking().Where(a => a.Status == "Published")
            .Select(a => new { a.Title, a.Slug, a.Category, a.Content }).Take(100).ToListAsync(ct);
        var matches = docs.Select(a => new
            {
                Article = a,
                Score = terms.Count(t => a.Title.Contains(t, StringComparison.OrdinalIgnoreCase)
                    || a.Content.Contains(t, StringComparison.OrdinalIgnoreCase)
                    || a.Category.Contains(t, StringComparison.OrdinalIgnoreCase))
            })
            .Where(x => x.Score > 0).OrderByDescending(x => x.Score).Take(4)
            .ToArray();
        if (matches.Length == 0)
            return new("No se encontraron fuentes aprobadas que respondan directamente.", []);

        var context = string.Join("\n\n---\n\n", matches.Select(x =>
            $"Fuente: {x.Article.Title} | Categoría: {x.Article.Category}\n{x.Article.Content}"));
        var sources = matches.Select(x => new KnowledgeSource(x.Article.Title, x.Article.Slug, x.Article.Category)).ToArray();
        return new(context, sources);
    }
}

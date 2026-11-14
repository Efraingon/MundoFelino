using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;

namespace MundoFelino.Api.Services;

public sealed record KnowledgeSource(string Title, string Slug, string Category);
public sealed record KnowledgeResult(string Context, IReadOnlyList<KnowledgeSource> Sources);

// Recuperación textual de demostración. Sustituir por búsqueda híbrida full-text + pgvector.
public sealed class KnowledgeRetriever(AppDbContext db, ILogger<KnowledgeRetriever> logger)
{
    private static readonly (string Title, string Slug, string Category, string Content)[] CuratedKnowledge =
    [
        ("Alimentación segura: qué sí y qué evitar", "alimentacion-segura", "Alimentación",
            "Los gatos son carnívoros estrictos. Nunca deben comer cebolla, ajo, puerro, chocolate, uvas, pasas, alcohol, cafeína, aguacate ni masa cruda con levadura. La leche de vaca suele causar diarrea. La base de la dieta debe ser alimento formulado para felinos, combinado con alimento húmedo para favorecer la hidratación y la salud renal. Evita huesos cocidos y restos condimentados."),
        ("Agua e hidratación: cómo lograr que beba más", "agua-e-hidratacion", "Alimentación",
            "Los gatos tienen poca sed innata. Ofrece varias fuentes de agua en movimiento, cambia el agua a diario, separa el bebedero de la comida y del arenero y añade alimento húmedo a su ración. La deshidratación crónica favorece problemas renales y urinarios."),
        ("Señales de dolor que suelen pasar desapercibidas", "senales-de-dolor", "Salud",
            "Los gatos enmascaran el dolor. Señales de alerta: aislarse, dejar de saltar a sus sitios habituales, postura encorvada, ojos semicerrados, pelaje desaliñado, dejar de asearse, evitar que lo toquen, cambios de apetito o visitas frecuentes al arenero sin orinar. Ante estas señales, consulta al veterinario."),
        ("El arenero: ubicación, tipo y limpieza", "el-arenero-guia-practica", "Comportamiento",
            "Regla práctica: una bandeja por gato más una adicional. Ubícalas en zonas tranquilas, lejos de la comida y de aparatos ruidosos. Limpia los residuos a diario y renueva la arena con frecuencia. La arena aglomerante sin perfume suele ser la mejor aceptada."),
        ("Vacunación y desparasitación básica", "vacunacion-y-desparasitacion", "Salud",
            "El esquema esencial incluye la triple felina (panleucopenia, calicivirus y rinotraqueítis) y la vacuna contra la rabia. La desparasitación interna y externa debe mantenerse incluso en gatos de interior, porque los parásitos pueden llegar en calzado o ropa. Confirma el calendario con tu veterinario."),
        ("Primeras semanas en un hogar nuevo", "primeras-semanas-en-casa", "Comportamiento",
            "Cada gato tiene sus tiempos. Prepara una habitación segura con agua, arenero, escondites y rascador. Mantén rutinas de juego de 10 a 15 minutos, ofrece enriquecimiento vertical y evita forzar el contacto. Las revisiones veterinarias periódicas completan la adaptación."),
    ];

    private static long _dbUnavailableUntilTicks;

    public async Task<KnowledgeResult> RetrieveAsync(string question, CancellationToken ct)
    {
        var terms = question.ToLowerInvariant()
            .Split([' ', ',', '.', ';', ':', '?', '!', '¿', '¡', '\n', '\r'],
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(t => t.Length >= 4).Distinct().Take(8).ToArray();
        if (terms.Length == 0) return new("No se encontraron fuentes específicas.", []);

        if (Volatile.Read(ref _dbUnavailableUntilTicks) > DateTime.UtcNow.Ticks)
            return BuildResult(terms, CuratedKnowledge);

        try
        {
            var docs = await db.Articles.AsNoTracking().Where(a => a.Status == "Published")
                .Select(a => new { a.Title, a.Slug, a.Category, a.Content }).Take(100).ToListAsync(ct);

            var published = docs
                .Select(a => (a.Title, a.Slug, a.Category, a.Content))
                .ToArray();
            return BuildResult(terms, published.Length > 0 ? published : CuratedKnowledge);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            // La base de datos puede no estar disponible; usamos la guía curada para que el chat siga respondiendo.
            Volatile.Write(ref _dbUnavailableUntilTicks, DateTime.UtcNow.AddMinutes(2).Ticks);
            logger.LogWarning("No se pudo recuperar conocimiento de la base de datos: {Message}", ex.Message);
            return BuildResult(terms, CuratedKnowledge);
        }
    }

    private static KnowledgeResult BuildResult(
        string[] terms,
        IReadOnlyList<(string Title, string Slug, string Category, string Content)> docs)
    {
        var matches = docs.Select(article => new
            {
                Article = article,
                Score = terms.Count(t => article.Title.Contains(t, StringComparison.OrdinalIgnoreCase)
                    || article.Content.Contains(t, StringComparison.OrdinalIgnoreCase)
                    || article.Category.Contains(t, StringComparison.OrdinalIgnoreCase))
            })
            .Where(x => x.Score > 0).OrderByDescending(x => x.Score).Take(2)
            .ToArray();
        if (matches.Length == 0)
            return new("No se encontraron fuentes aprobadas que respondan directamente.", []);

        var context = string.Join("\n\n---\n\n", matches.Select(x =>
            $"Fuente: {x.Article.Title} | Categoría: {x.Article.Category}\n{x.Article.Content}"));
        var sources = matches.Select(x => new KnowledgeSource(x.Article.Title, x.Article.Slug, x.Article.Category)).ToArray();
        return new(context, sources);
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;
using System.Text.Json;


namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/articles")]
public sealed class ArticlesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPublished([FromQuery] string? category, CancellationToken ct)
    {
        try
        {
            var query = db.Articles.AsNoTracking().Where(a => a.Status == "Published");
            if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);
            var rows = await query.OrderByDescending(a => a.PublishedAt)
                .Select(a => new { a.Id, a.Title, a.Slug, a.Summary, a.Category, a.PublishedAt })
                .Take(100).ToListAsync(ct);
            
            if (rows.Count == 0)
            {
                return Ok(new { message = "No hay artículos publicados. Usa datos simulados.", data = GetMockArticles(category) });
            }
            
            return Ok(rows);
        }
        catch (Exception ex)
        {
            return Ok(new { message = "Conexión a base de datos no disponible. Usando datos simulados.", data = GetMockArticles(category) });
        }
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        try
        {
            var row = await db.Articles.AsNoTracking()
                .Where(a => a.Slug == slug && a.Status == "Published")
                .Select(a => new { a.Id, a.Title, a.Slug, a.Summary, a.Content, a.Category, a.PublishedAt })
                .SingleOrDefaultAsync(ct);
            
            if (row != null)
            {
                return Ok(row);
            }
            
            // Fallback a datos simulados si no se encuentra el artículo o hay error de conexión
            var mockArticle = GetMockArticleBySlug(slug);
            if (mockArticle != null)
            {
                return Ok(mockArticle);
            }
            
            return NotFound();
        }
        catch (Exception ex)
        {
            var mockArticle = GetMockArticleBySlug(slug);
            if (mockArticle != null)
            {
                return Ok(mockArticle);
            }
            return NotFound();
        }
    }
    
    private List<dynamic> GetMockArticles(string? category)
    {
        var articles = new List<dynamic>
        {
            new { id = 1, title = "Cómo alimentar a tu gato", slug = "como-alimentar-gato", summary = "Guía completa sobre nutrición felina para todos los estadios de vida.", category = "Nutrición", published_at = DateTime.UtcNow.AddDays(-5) },
            new { id = 2, title = "Vacunación: ¿Cuándo y qué?", slug = "vacunacion-cuando-y-que", summary = "Calendario de vacunas esenciales para gatos.", category = "Salud", published_at = DateTime.UtcNow.AddDays(-7) },
            new { id = 3, title = "Cuidados básicos del gato doméstico", slug = "cuidados-basicos-gato-domestico", summary = "Higiene, juego y atención veterinaria preventiva.", category = "Cuidados", published_at = DateTime.UtcNow.AddDays(-10) },
            new { id = 4, title = "Señales de que tu gato necesita ir al veterinario", slug = "señales-gato-necesita-veterinario", summary = "Cuándo preocuparte y qué hacer ante cambios en el comportamiento.", category = "Salud", published_at = DateTime.UtcNow.AddDays(-12) },
            new { id = 5, title = "Hidratación: Clave para la salud felina", slug = "hidratacion-gato", summary = "Por qué los gatos necesitan agua y cómo incentivar su consumo.", category = "Nutrición", published_at = DateTime.UtcNow.AddDays(-15) },
        };
        
        if (!string.IsNullOrWhiteSpace(category))
        {
            articles = articles.Where(a => a.category == category).ToList();
        }
        
        return articles;
    }
    
    private dynamic? GetMockArticleBySlug(string slug)
    {
        var mockArticles = new List<dynamic>
        {
            new { id = 1, title = "Cómo alimentar a tu gato", slug = "como-alimentar-gato", summary = "Guía completa sobre nutrición felina para todos los estadios de vida.", content = "Los gatos necesitan una dieta balanceada rica en proteínas animales. El alimento húmedo es más saludable que el seco y debe representar al menos el 50% de su dieta diaria.", category = "Nutrición", published_at = DateTime.UtcNow.AddDays(-5) },
            new { id = 2, title = "Vacunación: ¿Cuándo y qué?", slug = "vacunacion-cuando-y-que", summary = "Calendario de vacunas esenciales para gatos.", content = "Las vacunas son fundamentales para prevenir enfermedades. Los gatitos deben recibir su primera vacuna a los 8 semanas, seguida de refuerzos cada mes hasta cumplir 5 meses. Luego se aplican anualmente.", category = "Salud", published_at = DateTime.UtcNow.AddDays(-7) },
            new { id = 3, title = "Cuidados básicos del gato doméstico", slug = "cuidados-basicos-gato-domestico", summary = "Higiene, juego y atención veterinaria preventiva.", content = "Los gatos necesitan un mínimo de 15 minutos de juego interactivo al día. Mantén sus uñas cortas, proporciona arena limpia y asegúrate de que tengan espacio para escalar y explorar.", category = "Cuidados", published_at = DateTime.UtcNow.AddDays(-10) },
            new { id = 4, title = "Señales de que tu gato necesita ir al veterinario", slug = "señales-gato-necesita-veterinario", summary = "Cuándo preocuparte y qué hacer ante cambios en el comportamiento.", content = "Cualquier cambio drástico en el apetito, actividad o hábitos intestinales debe ser evaluado por un veterinario. Pérdida de peso, vómitos persistentes o falta de ganas de saltar son señales de alerta.", category = "Salud", published_at = DateTime.UtcNow.AddDays(-12) },
            new { id = 5, title = "Hidratación: Clave para la salud felina", slug = "hidratacion-gato", summary = "Por qué los gatos necesitan agua y cómo incentivar su consumo.", content = "Los gatos tienen un instinto natural de no beber agua que se ve en su carne fresca. Usa fuentes de agua, cambia el agua diariamente y considera añadir humectantes a la comida seca para aumentar la ingesta hídrica.", category = "Nutrición", published_at = DateTime.UtcNow.AddDays(-15) },
        };
        
        var article = mockArticles.FirstOrDefault(a => a.slug?.ToLower() == slug.ToLower());
        return article;
    }
    

}
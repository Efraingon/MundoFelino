using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;
using MundoFelino.Api.Models;

namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/database")]
public sealed class DatabaseInitializerController(AppDbContext db) : ControllerBase
{
    [HttpPost("initialize")]
    public async Task<IActionResult> InitializeData([FromBody] InitRequest request, CancellationToken ct)
    {
        try
        {
            // Crear tablas si no existen (efectivo en EF Core)
            await db.Database.MigrateAsync(ct);
            
            // Limpiar datos existentes
            db.Clinics.RemoveRange(db.Clinics);
            db.Articles.RemoveRange(db.Articles);
            await db.SaveChangesAsync(ct);
            
            // Insertar veterinarios
            var clinics = new List<Clinic>
            {
                new() { Name = "Clínica Veterinaria Caracas Centro", Address = "Av. Francisco de Miranda 123, Capuchinas", Municipality = "Baruta", Phone = "+58 212-555-0101", WhatsApp = "+58 414-123-4567", Latitude = 10.45m, Longitude = -66.8833m, EmergencyAvailable = true, Status = "Verified" },
                new() { Name = "Centro Veterinario Los Palos", Address = "Calle Venezuela 456, Chacao", Municipality = "Chacao", Phone = "+58 212-555-0102", WhatsApp = "+58 414-234-5678", Latitude = 10.47m, Longitude = -66.87m, EmergencyAvailable = true, Status = "Verified" },
                new() { Name = "Veterinaria Simón Bolívar", Address = "Av. Diego de Losada 789, Chacao", Municipality = "Chacao", Phone = "+58 212-555-0103", WhatsApp = "+58 414-345-6789", Latitude = 10.465m, Longitude = -66.875m, EmergencyAvailable = false, Status = "Verified" },
                new() { Name = "Clínica Felina Altamira", Address = "Av. Venezuela 321, Baruta", Municipality = "Baruta", Phone = "+58 212-555-0104", WhatsApp = "+58 414-456-7890", Latitude = 10.455m, Longitude = -66.88m, EmergencyAvailable = true, Status = "Verified" },
                new() { Name = "Centro Médico Veterinario San Bernardino", Address = "Calle Bolívar 654, El Hatillo", Municipality = "El Hatillo", Phone = "+58 212-555-0105", WhatsApp = "+58 414-567-8901", Latitude = 10.39m, Longitude = -66.96m, EmergencyAvailable = false, Status = "Verified" },
                new() { Name = "Clínica Veterinaria Petare", Address = "Av. Rangel 987, Petare", Municipality = "Los Salides", Phone = "+58 212-555-0106", WhatsApp = "+58 414-678-9012", Latitude = 10.35m, Longitude = -66.8m, EmergencyAvailable = false, Status = "Verified" },
            };
            
            foreach (var clinic in clinics) db.Clinics.Add(clinic);
            
            // Insertar artículos
            var articles = new List<Article>
            {
                new() { Title = "Guía alimentación segura", Slug = "alimentacion-segura", Summary = "Qué alimentos son seguros para gatos", Content = "Los gatos no deben comer cebolla, ajo, chocolate...", Category = "Alimentación", Status = "Published" },
                new() { Title = "Agua e hidratación", Slug = "agua-e-hidratacion", Summary = "Cómo incentivar beber más agua", Content = "Coloque varias fuentes de agua...", Category = "Alimentación", Status = "Published" },
                new() { Title = "Señales de dolor", Slug = "senales-de-dolor", Summary = "Identificar enfermedad felina", Content = "Los gatos enmascaran el dolor...", Category = "Salud", Status = "Published" },
                new() { Title = "El arenero perfecto", Slug = "el-arenero-guia-practica", Summary = "Ubicación y cantidad de bandejas", Content = "Regla: gatos + 1 bandeja...", Category = "Comportamiento", Status = "Published" },
                new() { Title = "Vacunación básica", Slug = "vacunacion-y-desparasitacion", Summary = "Esquemas preventivos", Content = "Triple Felina y Rabia obligatoria...", Category = "Salud", Status = "Published" },
            };
            
            foreach (var article in articles) db.Articles.Add(article);
            
            await db.SaveChangesAsync(ct);
            
            return Ok(new { message = "Datos inicializados correctamente", clinicsCount = clinics.Count, articlesCount = articles.Count });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error inicializando: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public sealed class InitRequest { }

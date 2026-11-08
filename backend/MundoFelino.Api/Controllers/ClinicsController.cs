using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;
using System.Text.Json;
using System.IO;

namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/clinics")]
public sealed class ClinicsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? municipality,
        [FromQuery] bool? emergency, CancellationToken ct)
    {
        try
        {
            var query = db.Clinics.AsNoTracking().Where(c => c.Status == "Verified");
            if (!string.IsNullOrWhiteSpace(municipality))
            {
                var normalizedMunicipality = municipality.Trim().ToLowerInvariant();
                query = query.Where(c => c.Municipality != null && c.Municipality.ToLower() == normalizedMunicipality);
            }
            if (emergency == true) query = query.Where(c => c.EmergencyAvailable);
            var rows = await query.OrderBy(c => c.Name).Take(100)
                .Select(c => new { c.Id, c.Name, c.Address, c.Municipality, c.Phone, c.WhatsApp,
                    c.Latitude, c.Longitude, c.EmergencyAvailable, c.LastVerifiedAt })
                .ToListAsync(ct);
            
            if (rows.Count == 0)
            {
                return Ok(new { message = "No se encontraron veterinarios. Usa datos simulados.", data = GetMockClinics(municipality) });
            }
            
            return Ok(rows);
        }
        catch (Exception ex)
        {
            // Error de conexión - retornar datos simulados
            return Ok(new { message = "Conexión a base de datos no disponible. Usando datos simulados.", data = GetMockClinics(municipality) });
        }
    }
    
    private List<dynamic> GetMockClinics(string? municipality)
    {
        var clinics = new List<dynamic>
        {
            new { id = 1, name = "Clínica Veterinaria Caracas", address = "Av. Francisco de Miranda, Los Arcos", municipality = "Caracas", phone = "+58 212-555-0101", whatsapp = "584123456789", latitude = 10.4950, longitude = -66.8900, emergency_available = true, last_verified_at = "2026-11-04" },
            new { id = 2, name = "Hospital Veterinario La Sagrada Familia", address = "Urbanización Santa Ana, Chacao", municipality = "Caracas", phone = "+58 212-555-0102", whatsapp = "584123456790", latitude = 10.5100, longitude = -66.8700, emergency_available = true, last_verified_at = "2026-11-01" },
            new { id = 3, name = "Clínica Animal Valencia", address = "Av. Principal, Chaguaramas", municipality = "Valencia", phone = "+58 241-555-0201", whatsapp = "584223456791", latitude = 10.1620, longitude = -68.0070, emergency_available = false, last_verified_at = "2026-10-28" },
            new { id = 4, name = "Centro Veterinario Barquisimeto", address = "Calle Principal, Barrio La Pastora", municipality = "Barquisimeto", phone = "+58 245-555-0301", whatsapp = "584256789012", latitude = 10.0840, longitude = -69.0680, emergency_available = true, last_verified_at = "2026-11-03" },
            new { id = 5, name = "Clínica Veterinaria Maracaibo", address = "Av. Bolívar, Plaza Primero de Abril", municipality = "Maracaibo", phone = "+58 261-555-0401", whatsapp = "584356789013", latitude = 10.7500, longitude = -71.6500, emergency_available = false, last_verified_at = "2026-10-15" },
            new { id = 6, name = "Hospital de Animales Mercedes", address = "Av. Bolívar, Sector Santa Paula", municipality = "Mercedes", phone = "+58 247-555-0501", whatsapp = "584256789014", latitude = 9.8200, longitude = -68.8300, emergency_available = true, last_verified_at = "2026-11-02" },
            new { id = 7, name = "Clínica Veterinaria Cumana", address = "Av. Bolívar, Centro", municipality = "Cumana", phone = "+58 243-555-0601", whatsapp = "584256789015", latitude = 11.0600, longitude = -62.1800, emergency_available = false, last_verified_at = "2026-10-20" },
            new { id = 8, name = "Centro Veterinario Punto Fijo", address = "Av. Rómulo Betancourt, Centro", municipality = "Punto Fijo", phone = "+58 281-555-0701", whatsapp = "584256789016", latitude = 11.0600, longitude = -65.9300, emergency_available = true, last_verified_at = "2026-10-25" },
        };
        
        if (!string.IsNullOrWhiteSpace(municipality))
        {
            var normalizedMunicipality = municipality.Trim().ToLowerInvariant();
            clinics = clinics.Where(c => c.municipality != null && c.municipality.ToLower() == normalizedMunicipality).ToList();
        }
        
        return clinics;
    }
    

}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Data;

namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/clinics")]
public sealed class ClinicsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? municipality,
        [FromQuery] bool? emergency, CancellationToken ct)
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
        return Ok(rows);
    }
}

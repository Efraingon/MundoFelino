using Microsoft.AspNetCore.Mvc;
using MundoFelino.Api.Models;

namespace MundoFelino.Api.Controllers;

[ApiController]
[Route("api/v1/libraries")]
public sealed class LibrariesController : ControllerBase
{
    // Endpoint de prueba - actualmente usa Clinics porque no hay tabla libraries en la DB
    [HttpGet]
    public IActionResult Search([FromQuery] string? municipality = null, 
        [FromQuery] bool? emergency = null)
    {
        var message = new[] { "Libraries endpoint placeholder",
            "Este endpoint debería leer de una tabla 'libraries' en PostgreSQL",
            "Actualmente devuelve datos vacíos hasta que la tabla sea creada." };
        
        return Ok(message);
    }
}

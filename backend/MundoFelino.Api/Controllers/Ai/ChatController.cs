using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace MundoFelino.Api.Controllers.Ai;

public class ChatController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ChatController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> AskQuestion([FromBody] ChatRequest request)
    {
        try
        {
            var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                return BadRequest(new { error = "API key no configurada. Por favor establezca la variable de entorno GEMINI_API_KEY" });
            }

            // Contexto predefinido sobre el tema del chat (cuidado de gatos)
            var question = request.Question ?? "";
            
            // Construir prompt con contexto
            var context = @"Eres un experto en cuidado de gatos. Responde preguntas sobre: alimentación, higiene, comportamiento, salud, juego, adopción, enfermedades comunes, nutrición felina, grooming, socialización, prevención de problemas de comportamiento. Sé amigable, informativo y práctico. Respuestas concisas pero completas.";
            
            var prompt = $"{context}\n\nPregunta: {question}";
            
            // Llamada a Google Gemini API (versión gratuita)
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
            
            var requestBody = new
            {
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.7f,
                    maxOutputTokens = 512,
                    topP = 0.95f
                }
            };

            var content = JsonSerializer.Serialize(requestBody);
            var headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "Accept", "application/json" }
            };

            using var responseMessage = await _httpClient.PostAsync(url, new StringContent(content, System.Text.Encoding.UTF8, "application/json"));
            
            if (responseMessage.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                return Unauthorized(new { error = "Error con la API de Google Gemini. Verifica que GEMINI_API_KEY sea válida." });
            }

            var responseJson = await responseMessage.Content.ReadAsStringAsync();
            
            // Intentar parsear respuesta de Gemini
            if (string.IsNullOrEmpty(responseJson) || responseJson.Contains("error"))
            {
                // Fallback: devolver una respuesta genérica amable si hay error
                return Ok(new 
                { 
                    text = $"🐱 Hola! Soy el asistente virtual de Mundo Felino. Te ayudo con preguntas sobre cuidado de gatos. Pregúntame algo como: ¿Cómo alimentar a mi gato? o ¿Mi gato no para de maullar." 
                });
            }

            try
            {
                var responseObj = JsonSerializer.Deserialize<GenericApiResponse>(responseJson);
                
                if (responseObj?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text != null)
                {
                    var geminiResponse = responseObj.candidates[0].content.parts[0].text;
                    
                    // Limpiar formato del Markdown si existe
                    var cleanResponse = geminiResponse
                        .Replace("**", "")
                        .Replace("*", "")
                        .Replace("`", "");
                    
                    return Ok(new { text = cleanResponse });
                }
            }
            catch { /* Ignorar errores de deserialización */ }

            // Fallback: respuesta genérica amable sobre gatos
            return Ok(new 
            { 
                text = $"🐱 ¡Hola! Soy tu asistente virtual de Mundo Felino. Te puedo ayudar con preguntas sobre alimentación, higiene, comportamiento, salud o cualquier otra cosa relacionada con el cuidado de tu gato.\n\nPregúntame algo como:\n• ¿Cómo debo alimentar a mi gato?\n• ¿Por qué mi gato no para de maullar?\n• ¿Mi gato se está rascando demasiado?\n• ¿Qué hacer si mi gato come una planta tóxica?" 
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en chat: {ex.Message}");
            return StatusCode(503, new { error = "Servicio de IA temporalmente no disponible", fallbackResponse = "Tu pregunta se guardará para revisión posterior." });
        }
    }

    public class ChatRequest
    {
        public string? Question { get; set; }
    }

    public class GenericApiResponse
    {
        public object[]? responses { get; set; }
        public List<dynamic>? candidates { get; set; }
    }
}
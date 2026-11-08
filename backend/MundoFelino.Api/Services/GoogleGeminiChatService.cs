using Microsoft.Extensions.Http;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace MundoFelino.Api.Services;

public class GoogleGeminiChatService : IAiProvider
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public GoogleGeminiChatService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    }

    public async Task<AiResponse> GenerateAsync(AiRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                // Fallback a respuestas genéricas cuando no hay API key
                return new AiResponse(
                    Text: GetDefaultCatCareResponse(request.Question),
                    Provider: "Gemini",
                    Model: "gemini-fallback"
                );
            }

            var context = request.SystemPrompt ?? @"Eres un experto veterinario especializado en cuidado de gatos. Responde preguntas sobre alimentación, higiene, comportamiento, salud, nutrición felina, grooming y adopción responsable.";
            
            var question = request.Question;
            var prompt = $"{context}\n\n{question}";
            
            // URL de la API de Google Gemini (versión gratuita)
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";
            
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
                },
                safetySettings = new[]
                {
                    new { category = "HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "SafetySetting.BLOCK_NONE" },
                    new { category = "HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "SafetySetting.BLOCK_NONE" },
                    new { category = "HarmCategory.HARM_CATEGORY_HATE_SPEECH", threshold = "SafetySetting.BLOCK_NONE" },
                    new { category = "HarmCategory.HARM_CATEGORY_HARASSMENT", threshold = "SafetySetting.BLOCK_NONE" }
                }
            };

            var content = JsonSerializer.Serialize(requestBody);
            var headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "Accept", "application/json" }
            };

            using var responseMessage = await _httpClient.PostAsync(url, new StringContent(content, Encoding.UTF8, "application/json"), cancellationToken);
            
            if (responseMessage.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                Console.WriteLine("API key no válida. Usando fallback.");
                return new AiResponse(
                    Text: GetDefaultCatCareResponse(request.Question),
                    Provider: "Gemini",
                    Model: "gemini-fallback"
                );
            }

            var responseJson = await responseMessage.Content.ReadAsStringAsync(cancellationToken);
            
            // Fallback si la API no responde correctamente
            if (string.IsNullOrEmpty(responseJson) || responseJson.Contains("error"))
            {
                Console.WriteLine("Respuesta inválida. Usando fallback.");
                return new AiResponse(
                    Text: GetDefaultCatCareResponse(request.Question),
                    Provider: "Gemini",
                    Model: "gemini-fallback"
                );
            }

            try
            {
                var responseObj = JsonSerializer.Deserialize<ApiResponse>(responseJson);
                
                if (responseObj?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text != null)
                {
                    var geminiResponse = responseObj.candidates[0].content.parts[0].text;
                    
                    // Limpiar formato Markdown
                    var cleanResponse = geminiResponse
                        .Replace("**", "")
                        .Replace("*", "")
                        .Replace("`", "")
                        .Trim();
                    
                    return new AiResponse(
                        Text: cleanResponse,
                        Provider: "Gemini",
                        Model: "gemini-1.5-flash"
                    );
                }
            }
            catch { /* Ignorar errores de deserialización */ }

            // Fallback si la respuesta está en otro formato o hay error
            Console.WriteLine("Error procesando respuesta de Gemini. Usando fallback.");
            return new AiResponse(
                Text: GetDefaultCatCareResponse(request.Question),
                Provider: "Gemini",
                Model: "gemini-fallback"
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error en Google Gemini API: {ex.Message}");
            return new AiResponse(
                Text: GetDefaultCatCareResponse(request.Question),
                Provider: "Gemini",
                Model: "gemini-fallback"
            );
        }
    }

    private string GetDefaultCatCareResponse(string question)
    {
        var questionLower = question.ToLower();
        
        if (questionLower.Contains("alimentar") || questionLower.Contains("comer"))
            return "🐱 Para alimentar a tu gato:\n\n• Comida: Prefiere dietas premium específicas para gatos adultos/cachorros.\n• Agua: Ofrece siempre agua fresca, idealmente de una fuente con flujo.\n• Raciones: Sigue las recomendaciones del fabricante según peso y edad.";
        
        if (questionLower.Contains("comportamiento") || questionLower.Contains("maulla"))
            return "🐱 Sobre comportamiento felino:\n\n• Los gatos maúllan principalmente para comunicarse con humanos.\n• Proporciona arañeros adecuados y muéstrale dónde usarlos.\n• Ofrece juguetes diariamente durante 10-15 minutos.";
        
        if (questionLower.Contains("salud") || questionLower.Contains("enfermo"))
            return "🐱 Señales de alerta en salud felina:\n\n• Pérdida de peso inexplicable\n• Dificultad para orinar\n• Letargia o falta de apetito\n• Vómitos repetidos\n• Ojos rojos o secreción ocular\n\n📞 Si observas estas señales, consulta a tu veterinario inmediatamente.";
        
        if (questionLower.Contains("adopcion") || questionLower.Contains("adoptar"))
            return "🐱 Consejos para adopción responsable:\n\n• Visita refugios locales donde hay muchos gatos esperando un hogar.\n• Realiza preguntas sobre el historial del gato.\n• Considera que los adultos suelen ser más calmados que los gatitos.";
        
        // Respuesta genérica por defecto
        return $"🐱 ¡Hola! Soy tu asistente virtual de Mundo Felino. Te puedo ayudar con preguntas sobre:\n\n• Alimentación y nutrición felina\n• Comportamiento y entrenamiento\n• Salud y cuidados preventivos\n• Higiene y grooming\n• Jugar y enriquecimiento ambiental\n• Adopción responsable\n• Control de parásitos\n\n¡Pregunta cualquier cosa sobre el cuidado de tu gato!";
    }

    public class ApiResponse
    {
        public List<dynamic>? candidates { get; set; }
    }
}
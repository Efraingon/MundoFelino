using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace MundoFelino.Api.Services;

/// <summary>
/// Proveedor de Google Gemini. Si no hay API key o Google responde con error,
/// lanza una excepción para que <see cref="AiProviderRouter"/> pruebe Ollama.
/// </summary>
public sealed class GoogleGeminiChatService : IAiProvider
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly string _model;

    public GoogleGeminiChatService(
        HttpClient httpClient,
        IConfiguration configuration,
        IOptions<AiOptions> options)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Ai:GeminiApiKey"]
            ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        _model = string.IsNullOrWhiteSpace(options.Value.GeminiModel)
            ? "gemini-1.5-flash"
            : options.Value.GeminiModel;
    }

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_apiKey);

    public async Task<AiResponse> GenerateAsync(AiRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("GEMINI_API_KEY no está configurada.");

        var context = string.IsNullOrWhiteSpace(request.Context)
            ? string.Empty
            : $"\n\nContexto recuperado de la guía felina:\n{request.Context}";
        var prompt = $"{request.SystemPrompt}{context}\n\nPregunta del cuidador: {request.Question}";

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={Uri.EscapeDataString(_apiKey)}";
        var requestBody = new
        {
            contents = new[]
            {
                new { role = "user", parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.2f,
                maxOutputTokens = 800,
                topP = 0.95f
            }
        };

        using var response = await _httpClient.PostAsync(
            url,
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"),
            cancellationToken);

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var detail = responseJson.Length > 400 ? responseJson[..400] : responseJson;
            throw new HttpRequestException(
                $"Gemini respondió {(int)response.StatusCode} ({response.StatusCode}): {detail}");
        }

        var payload = JsonSerializer.Deserialize<GeminiResponse>(responseJson, JsonOptions);
        var text = payload?.Candidates?
            .SelectMany(candidate => candidate.Content?.Parts ?? [])
            .Select(part => part.Text)
            .FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));

        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Gemini devolvió una respuesta sin contenido.");

        var cleanResponse = text
            .Replace("**", string.Empty)
            .Replace("`", string.Empty)
            .Trim();

        return new AiResponse(cleanResponse, "Gemini", _model);
    }

    private sealed class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private sealed class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }
    }

    private sealed class GeminiContent
    {
        [JsonPropertyName("parts")]
        public List<GeminiPart>? Parts { get; set; }
    }

    private sealed class GeminiPart
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}

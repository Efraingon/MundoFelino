using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace MundoFelino.Api.Services;

public sealed class OllamaAiProvider(HttpClient http, IOptions<AiOptions> options) : IAiProvider
{
    private readonly OllamaOptions settings = options.Value.Ollama;

    public async Task<AiResponse> GenerateAsync(AiRequest request, CancellationToken ct)
    {
        var payload = new
        {
            model = settings.ChatModel,
            stream = false,
            messages = new[]
            {
                new { role = "system", content = request.SystemPrompt + "\n\nContexto recuperado:\n" + request.Context },
                new { role = "user", content = request.Question }
            },
            options = new { temperature = 0.2, num_predict = 800 }
        };
        using var response = await http.PostAsJsonAsync(
            $"{settings.BaseUrl.TrimEnd('/')}/api/chat", payload, ct);
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<OllamaChatResponse>(cancellationToken: ct);
        if (string.IsNullOrWhiteSpace(result?.Message?.Content))
            throw new InvalidOperationException("El proveedor devolvió una respuesta vacía.");
        return new AiResponse(result.Message.Content, "Ollama", settings.ChatModel);
    }

    private sealed record OllamaChatResponse(OllamaMessage? Message);
    private sealed record OllamaMessage(string? Role, string? Content);
}

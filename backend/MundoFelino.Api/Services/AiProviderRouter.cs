using Microsoft.Extensions.Options;

namespace MundoFelino.Api.Services;

/// <summary>
/// Elige el proveedor de IA configurado y, si falla, intenta el otro antes de
/// devolver un error. Así el chat responde con Gemini o con el modelo local de Ollama.
/// </summary>
public sealed class AiProviderRouter(
    GoogleGeminiChatService gemini,
    OllamaAiProvider ollama,
    IOptions<AiOptions> options,
    ILogger<AiProviderRouter> logger) : IAiProvider
{
    private readonly AiOptions settings = options.Value;

    public async Task<AiResponse> GenerateAsync(AiRequest request, CancellationToken cancellationToken)
    {
        var preferred = (settings.Provider ?? "Auto").Trim().ToLowerInvariant();
        IAiProvider[] chain = preferred switch
        {
            "gemini" => [gemini, ollama],
            "ollama" => [ollama, gemini],
            _ => gemini.IsConfigured ? [gemini, ollama] : [ollama, gemini]
        };

        Exception? lastError = null;
        foreach (var provider in chain)
        {
            try
            {
                var result = await provider.GenerateAsync(request, cancellationToken);
                if (!string.IsNullOrWhiteSpace(result.Text)) return result;
                lastError = new InvalidOperationException($"{result.Provider} devolvió una respuesta vacía.");
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                lastError = ex;
                logger.LogWarning("Proveedor IA {Provider} no disponible: {Message}", provider.GetType().Name, ex.Message);
            }
        }

        throw new InvalidOperationException("Ningún proveedor de IA pudo responder la consulta.", lastError);
    }
}

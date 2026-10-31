namespace MundoFelino.Api.Services;

public sealed record AiRequest(string SystemPrompt, string Question, string Context);
public sealed record AiResponse(string Text, string Provider, string Model);

public interface IAiProvider
{
    Task<AiResponse> GenerateAsync(AiRequest request, CancellationToken cancellationToken);
}

public sealed class AiOptions
{
    public string Provider { get; set; } = "Ollama";
    public int TimeoutSeconds { get; set; } = 45;
    public OllamaOptions Ollama { get; set; } = new();
}
public sealed class OllamaOptions
{
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string ChatModel { get; set; } = "qwen2.5:3b";
    public string EmbeddingModel { get; set; } = "nomic-embed-text";
}

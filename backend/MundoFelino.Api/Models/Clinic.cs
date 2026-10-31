namespace MundoFelino.Api.Models;
public sealed class Clinic
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Municipality { get; set; }
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool EmergencyAvailable { get; set; }
    public string Status { get; set; } = "";
    public DateTimeOffset? LastVerifiedAt { get; set; }
}

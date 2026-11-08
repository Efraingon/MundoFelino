namespace MundoFelino.Api.Models;

public sealed class Library
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Address { get; set; }
    public string Municipality { get; set; } = "";
    public string? Phone { get; set; }
    public string? WhatsApp { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Status { get; set; } = "Verified";
}

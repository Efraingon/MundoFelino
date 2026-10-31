using Microsoft.EntityFrameworkCore;
using MundoFelino.Api.Models;

namespace MundoFelino.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Clinic> Clinics => Set<Clinic>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Article>(e =>
        {
            e.ToTable("articles"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Title).HasColumnName("title");
            e.Property(x => x.Slug).HasColumnName("slug");
            e.Property(x => x.Summary).HasColumnName("summary");
            e.Property(x => x.Content).HasColumnName("content");
            e.Property(x => x.Category).HasColumnName("category");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.PublishedAt).HasColumnName("published_at");
        });
        b.Entity<Clinic>(e =>
        {
            e.ToTable("clinics"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Address).HasColumnName("address");
            e.Property(x => x.Municipality).HasColumnName("municipality");
            e.Property(x => x.Phone).HasColumnName("phone");
            e.Property(x => x.WhatsApp).HasColumnName("whatsapp");
            e.Property(x => x.Latitude).HasColumnName("latitude");
            e.Property(x => x.Longitude).HasColumnName("longitude");
            e.Property(x => x.EmergencyAvailable).HasColumnName("emergency_available");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.LastVerifiedAt).HasColumnName("last_verified_at");
        });
    }
}

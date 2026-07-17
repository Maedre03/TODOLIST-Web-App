using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoList.Domain.Entities;

namespace TodoList.Infrastructure.Persistence.Configurations;

public class TodoConfiguration : IEntityTypeConfiguration<Todo>
{
    public void Configure(EntityTypeBuilder<Todo> builder)
    {
        builder.ToTable("Todos");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        builder.Property(t => t.Priority)
            .HasConversion<string>() // Store enum as string in DB
            .HasMaxLength(20);

        builder.HasIndex(t => t.CreatedByUserId);
        builder.HasIndex(t => t.IsDeleted);

        // Global query filter for soft delete
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

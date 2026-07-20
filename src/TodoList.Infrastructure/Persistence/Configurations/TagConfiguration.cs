using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoList.Domain.Entities;

namespace TodoList.Infrastructure.Persistence.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Color)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(t => t.CreatedByUser)
            .WithMany(u => u.Tags)
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Global query filter to automatically hide soft-deleted tags
        builder.HasQueryFilter(t => !t.IsDeleted);

        // Many-to-many relationship configuration (can be done here or in TodoConfiguration)
        builder.HasMany(t => t.Todos)
            .WithMany(t => t.Tags)
            .UsingEntity<Dictionary<string, object>>(
                "TodoTags",
                j => j.HasOne<Todo>().WithMany().HasForeignKey("TodoId"),
                j => j.HasOne<Tag>().WithMany().HasForeignKey("TagId")
            );
    }
}

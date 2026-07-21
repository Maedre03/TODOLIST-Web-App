using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoList.Domain.Entities;

namespace TodoList.Infrastructure.Persistence.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.FilePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasOne(a => a.Todo)
            .WithMany(t => t.Attachments)
            .HasForeignKey(a => a.TodoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Apply global query filter for soft delete
        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}

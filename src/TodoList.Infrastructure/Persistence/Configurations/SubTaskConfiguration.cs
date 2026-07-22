using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TodoList.Domain.Entities;

namespace TodoList.Infrastructure.Persistence.Configurations;

public class SubTaskConfiguration : IEntityTypeConfiguration<SubTask>
{
    public void Configure(EntityTypeBuilder<SubTask> builder)
    {
        builder.ToTable("SubTasks");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.DisplayOrder)
            .IsRequired();

        // A SubTask belongs to a Todo
        builder.HasOne(t => t.Todo)
            .WithMany(t => t.SubTasks)
            .HasForeignKey(t => t.TodoId)
            .OnDelete(DeleteBehavior.Cascade); // If a Todo is deleted, its SubTasks should be deleted.

        // Global query filter for soft delete
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}

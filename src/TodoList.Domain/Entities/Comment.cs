using TodoList.Domain.Common;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a comment or note on a Todo item.
/// </summary>
public class Comment : Entity<Guid>
{
    public string Content { get; set; } = string.Empty;
    public Guid TodoId { get; set; }
    public Guid CreatedByUserId { get; set; }

    // Navigation properties
    public virtual Todo Todo { get; set; } = null!;
    public virtual User CreatedByUser { get; set; } = null!;

    protected Comment() { }

    public Comment(string content, Guid todoId, Guid createdByUserId)
    {
        Id = Guid.NewGuid();
        Content = content;
        TodoId = todoId;
        CreatedByUserId = createdByUserId;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
    }
}

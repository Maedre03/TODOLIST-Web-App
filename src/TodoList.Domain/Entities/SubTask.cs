using TodoList.Domain.Common;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a subtask within a Todo item.
/// </summary>
public class SubTask : Entity<Guid>
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    
    /// <summary>
    /// Foreign key for the parent Todo.
    /// </summary>
    public Guid TodoId { get; set; }

    /// <summary>
    /// Order in which the subtask is displayed.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Reference navigation property to the parent Todo.
    /// </summary>
    public virtual Todo Todo { get; set; } = null!;

    /// <summary>
    /// Parameterless constructor required by EF Core for materialization.
    /// </summary>
    protected SubTask() { }

    /// <summary>
    /// Primary constructor for initializing a new SubTask.
    /// </summary>
    public SubTask(string title, Guid todoId, int displayOrder = 0)
    {
        Id = Guid.NewGuid();
        Title = title;
        TodoId = todoId;
        DisplayOrder = displayOrder;
        IsCompleted = false;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }
}

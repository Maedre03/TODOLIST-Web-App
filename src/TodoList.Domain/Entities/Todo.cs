using TodoList.Domain.Common;
using TodoList.Domain.Enums;
using TodoList.Domain.Events;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a Todo task item.
/// </summary>
public class Todo : Entity<Guid>
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Foreign key for the User who owns this Todo.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Reference navigation property to the User.
    /// </summary>
    public virtual User CreatedByUser { get; set; } = null!;

    /// <summary>
    /// Collection navigation property for the Tags assigned to this Todo.
    /// </summary>
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();

    /// <summary>
    /// Collection navigation property for the SubTasks under this Todo.
    /// </summary>
    public virtual ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();

    /// <summary>
    /// Parameterless constructor required by EF Core for materialization.
    /// </summary>
    protected Todo() { }

    /// <summary>
    /// Primary constructor for initializing a new Todo item.
    /// </summary>
    public Todo(string title, string description, Priority priority, DateTime? dueDate, Guid createdByUserId)
    {
        Id = Guid.NewGuid();
        Title = title;
        Description = description;
        Priority = priority;
        DueDate = dueDate;
        CreatedByUserId = createdByUserId;
        IsCompleted = false;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;

        AddDomainEvent(new TodoCreatedEvent(this));
    }
}

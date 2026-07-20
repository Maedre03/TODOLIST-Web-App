using TodoList.Domain.Common;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a Tag that can be assigned to Todo items.
/// </summary>
public class Tag : Entity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;

    /// <summary>
    /// Foreign key for the User who owns this Tag.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Reference navigation property to the User.
    /// </summary>
    public virtual User CreatedByUser { get; set; } = null!;

    /// <summary>
    /// Collection navigation property for the Todos associated with this Tag.
    /// </summary>
    public virtual ICollection<Todo> Todos { get; set; } = new List<Todo>();

    protected Tag() { }

    public Tag(string name, string color, Guid createdByUserId)
    {
        Id = Guid.NewGuid();
        Name = name;
        Color = color;
        CreatedByUserId = createdByUserId;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }
}

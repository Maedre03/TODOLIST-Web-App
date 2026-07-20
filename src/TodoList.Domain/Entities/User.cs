using TodoList.Domain.Common;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a User in the system.
/// A user owns Todos and is used for authentication and authorization.
/// </summary>
public class User : Entity<Guid>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Collection navigation property representing the Todos owned by this user.
    /// </summary>
    public virtual ICollection<Todo> Todos { get; set; } = new List<Todo>();

    /// <summary>
    /// Collection navigation property representing the Tags created by this user.
    /// </summary>
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();

    /// <summary>
    /// Parameterless constructor required by EF Core for materialization.
    /// </summary>
    protected User() { }

    /// <summary>
    /// Primary constructor for initializing a new User.
    /// </summary>
    public User(string username, string email, string passwordHash)
    {
        Id = Guid.NewGuid();
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }
}

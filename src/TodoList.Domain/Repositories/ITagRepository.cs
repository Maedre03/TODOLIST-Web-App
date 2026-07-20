using TodoList.Domain.Entities;

namespace TodoList.Domain.Repositories;

/// <summary>
/// Repository interface for Tag entity.
/// </summary>
public interface ITagRepository : IRepository<Tag, Guid>
{
    /// <summary>
    /// Gets all tags for a specific user.
    /// </summary>
    Task<IReadOnlyList<Tag>> GetTagsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

using TodoList.Domain.Entities;

namespace TodoList.Domain.Repositories;

/// <summary>
/// Repository interface specific to Todo operations.
/// </summary>
public interface ITodoRepository : IRepository<Todo, Guid>
{
    Task<IReadOnlyList<Todo>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Todo?> GetByIdAndUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Todo> Items, int TotalCount)> GetPagedByUserIdAsync(Guid userId, int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending, bool? isCompleted, CancellationToken cancellationToken = default);
}

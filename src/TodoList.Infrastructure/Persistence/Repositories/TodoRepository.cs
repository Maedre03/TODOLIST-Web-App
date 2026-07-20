using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Infrastructure.Persistence.Repositories;

public class TodoRepository : GenericRepository<Todo, Guid>, ITodoRepository
{
    public TodoRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Todo>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Todos
            .Where(t => t.CreatedByUserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Todo?> GetByIdAndUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Todos
            .FirstOrDefaultAsync(t => t.Id == id && t.CreatedByUserId == userId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Todo> Items, int TotalCount)> GetPagedByUserIdAsync(Guid userId, int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending, bool? isCompleted, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken = default)
    {
        var query = DbContext.Todos.Where(t => t.CreatedByUserId == userId);

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(t => t.DueDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.DueDate <= endDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => t.Title.Contains(searchTerm) || t.Description.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "priority" => sortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "duedate" => sortDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            _ => sortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}

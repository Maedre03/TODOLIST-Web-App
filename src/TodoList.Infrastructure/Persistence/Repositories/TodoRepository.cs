using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Repositories;

namespace TodoList.Infrastructure.Persistence.Repositories;

public class TodoRepository : GenericRepository<Todo, Guid>, ITodoRepository
{
    public TodoRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public override async Task<Todo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Todos
            .Include(t => t.Tags)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Todo>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Todos
            .Include(t => t.Tags)
            .Include(t => t.SubTasks)
            .Where(t => t.CreatedByUserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Todo?> GetByIdAndUserAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Todos
            .Include(t => t.Tags)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == id && t.CreatedByUserId == userId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Todo> Items, int TotalCount)> GetPagedByUserIdAsync(Guid userId, int pageNumber, int pageSize, string? searchTerm, string? sortBy, bool sortDescending, bool? isCompleted, DateTime? startDate, DateTime? endDate, Guid? tagId, CancellationToken cancellationToken = default)
    {
        var query = DbContext.Todos
            .Include(t => t.Tags)
            .Include(t => t.SubTasks)
            .Where(t => t.CreatedByUserId == userId);

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

        if (tagId.HasValue)
        {
            query = query.Where(t => t.Tags.Any(tag => tag.Id == tagId.Value));
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => t.Title.Contains(searchTerm) || t.Description.Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "priority" => sortDescending 
                ? query.OrderByDescending(t => t.Priority == Priority.Critical ? 4 : t.Priority == Priority.High ? 3 : t.Priority == Priority.Medium ? 2 : 1) 
                : query.OrderBy(t => t.Priority == Priority.Critical ? 4 : t.Priority == Priority.High ? 3 : t.Priority == Priority.Medium ? 2 : 1),
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

using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Infrastructure.Persistence.Repositories;

public class TagRepository : GenericRepository<Tag, Guid>, ITagRepository
{
    public TagRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<Tag>> GetTagsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Tags
            .Where(t => t.CreatedByUserId == userId && !t.IsDeleted)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}

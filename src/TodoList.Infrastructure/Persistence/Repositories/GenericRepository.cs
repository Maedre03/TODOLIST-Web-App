using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Common;
using TodoList.Domain.Repositories;

namespace TodoList.Infrastructure.Persistence.Repositories;

public class GenericRepository<TEntity, TId> : IRepository<TEntity, TId> where TEntity : Entity<TId>
{
    protected readonly ApplicationDbContext DbContext;

    public GenericRepository(ApplicationDbContext dbContext)
    {
        DbContext = dbContext;
    }

    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        return await DbContext.Set<TEntity>().FindAsync(new object[] { id! }, cancellationToken);
    }

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbContext.Set<TEntity>().ToListAsync(cancellationToken);
    }

    public virtual async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await DbContext.Set<TEntity>().AddAsync(entity, cancellationToken);
    }

    public virtual void Update(TEntity entity)
    {
        DbContext.Set<TEntity>().Update(entity);
    }

    public virtual void Delete(TEntity entity)
    {
        DbContext.Set<TEntity>().Remove(entity);
    }
}

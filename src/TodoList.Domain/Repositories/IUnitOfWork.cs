using System.Threading;
using System.Threading.Tasks;

namespace TodoList.Domain.Repositories;

/// <summary>
/// Represents a Unit of Work to group database operations into a single transaction.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

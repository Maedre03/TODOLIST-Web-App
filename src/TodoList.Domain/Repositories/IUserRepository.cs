using TodoList.Domain.Entities;

namespace TodoList.Domain.Repositories;

/// <summary>
/// Repository interface specific to User operations.
/// </summary>
public interface IUserRepository : IRepository<User, Guid>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> IsEmailUniqueAsync(string email, CancellationToken cancellationToken = default);
}

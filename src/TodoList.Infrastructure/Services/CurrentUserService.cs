using TodoList.Application.Common.Interfaces;

namespace TodoList.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    // For now, return a dummy Guid or empty until we integrate HttpContextAccessor
    public Guid UserId => Guid.Empty;
}

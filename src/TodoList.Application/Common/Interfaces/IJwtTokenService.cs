using TodoList.Domain.Entities;

namespace TodoList.Application.Common.Interfaces;

/// <summary>
/// Service to generate secure JSON Web Tokens (JWT) for authenticated users.
/// </summary>
public interface IJwtTokenService
{
    string GenerateToken(User user);
}

using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;

namespace TodoList.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    public string GenerateToken(User user)
    {
        // Dummy implementation until we implement real JWT creation
        return $"dummy_token_for_{user.Id}";
    }
}

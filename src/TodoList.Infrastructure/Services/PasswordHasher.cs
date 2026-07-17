using TodoList.Application.Common.Interfaces;

namespace TodoList.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        // Dummy implementation until we add BCrypt
        return $"Hashed_{password}";
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        return hashedPassword == $"Hashed_{password}";
    }
}

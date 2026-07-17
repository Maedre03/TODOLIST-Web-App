namespace TodoList.Application.Common.Interfaces;

/// <summary>
/// Service to hash and verify passwords using secure algorithms like BCrypt.
/// </summary>
public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

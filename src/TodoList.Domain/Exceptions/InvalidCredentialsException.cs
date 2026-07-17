namespace TodoList.Domain.Exceptions;

/// <summary>
/// Exception thrown when authentication fails due to incorrect email or password.
/// </summary>
public class InvalidCredentialsException : DomainException
{
    public InvalidCredentialsException() 
        : base("Invalid email or password.")
    {
    }
}

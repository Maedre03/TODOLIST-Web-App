namespace TodoList.Domain.Exceptions;

/// <summary>
/// Exception thrown when attempting to register a user with an email that already exists.
/// </summary>
public class EmailAlreadyInUseException : DomainException
{
    public EmailAlreadyInUseException(string email) 
        : base($"The email address '{email}' is already in use.")
    {
    }
}

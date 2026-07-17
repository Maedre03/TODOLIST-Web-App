namespace TodoList.Domain.Exceptions;

/// <summary>
/// Base class for all custom domain exceptions.
/// These exceptions represent business rule violations.
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message)
    {
    }
}

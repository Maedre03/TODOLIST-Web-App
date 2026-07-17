namespace TodoList.Domain.Exceptions;

/// <summary>
/// Exception thrown when a user attempts to access or modify a Todo item they do not own.
/// </summary>
public class UnauthorizedTodoAccessException : DomainException
{
    public UnauthorizedTodoAccessException(Guid todoId, Guid userId)
        : base($"User with ID {userId} is not authorized to access Todo item with ID {todoId}.")
    {
    }
}

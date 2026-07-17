namespace TodoList.Domain.Exceptions;

/// <summary>
/// Exception thrown when a requested Todo item cannot be found.
/// </summary>
public class TodoNotFoundException : DomainException
{
    public TodoNotFoundException(Guid todoId) 
        : base($"Todo item with ID {todoId} was not found.")
    {
    }
}

namespace TodoList.Domain.Exceptions;

/// <summary>
/// Exception thrown when a requested SubTask item cannot be found.
/// </summary>
public class SubTaskNotFoundException : DomainException
{
    public SubTaskNotFoundException(Guid subTaskId) 
        : base($"SubTask item with ID {subTaskId} was not found.")
    {
    }
}

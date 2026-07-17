using System;

namespace TodoList.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when a Todo item is not found.
/// </summary>
public class TodoNotFoundException : Exception
{
    public TodoNotFoundException(Guid id) 
        : base($"Todo item with ID '{id}' was not found.")
    {
    }
}

using TodoList.Domain.Common;
using TodoList.Domain.Entities;

namespace TodoList.Domain.Events;

/// <summary>
/// Event raised when a new Todo item is created.
/// </summary>
public class TodoCreatedEvent : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public Todo Todo { get; }

    public TodoCreatedEvent(Todo todo)
    {
        Todo = todo;
    }
}

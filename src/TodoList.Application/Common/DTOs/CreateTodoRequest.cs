using System;
using System.Collections.Generic;
using TodoList.Domain.Enums;

namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object for creating a new Todo item.
/// </summary>
public record CreateTodoRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public RecurrenceInterval Recurrence { get; set; }
    public List<Guid> TagIds { get; set; } = new();
}

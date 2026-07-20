using System;
using TodoList.Domain.Enums;

namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object for creating a new Todo item.
/// </summary>
public record CreateTodoRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Priority Priority { get; init; }
    public DateTime? DueDate { get; init; }
    public List<Guid>? TagIds { get; init; }
}

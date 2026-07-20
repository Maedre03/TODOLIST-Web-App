using System;
using TodoList.Domain.Enums;

namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object for updating an existing Todo item.
/// </summary>
public record UpdateTodoRequest
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Priority Priority { get; init; }
    public DateTime? DueDate { get; init; }
    public List<Guid>? TagIds { get; init; }
}

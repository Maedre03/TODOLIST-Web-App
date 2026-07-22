using System;

namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object representing a subtask within a Todo item.
/// </summary>
public class SubTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int DisplayOrder { get; set; }
}

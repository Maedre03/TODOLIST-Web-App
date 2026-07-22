using System;
using System.Collections.Generic;
using TodoList.Domain.Enums;

namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object representing a Todo item.
/// </summary>
public class TodoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public Priority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public RecurrenceInterval Recurrence { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TagDto> Tags { get; set; } = new();
    public List<SubTaskDto> SubTasks { get; set; } = new();
    public List<AttachmentDto> Attachments { get; set; } = new();
}

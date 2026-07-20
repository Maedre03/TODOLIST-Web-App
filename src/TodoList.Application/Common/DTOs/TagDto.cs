namespace TodoList.Application.Common.DTOs;

/// <summary>
/// Data Transfer Object for a Tag.
/// </summary>
public record TagDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
}

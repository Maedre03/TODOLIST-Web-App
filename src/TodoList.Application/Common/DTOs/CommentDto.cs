namespace TodoList.Application.Common.DTOs;

public class CommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid TodoId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedByUserName { get; set; }
}

using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Commands.Comments;

public class AddCommentCommand : IRequest<ApiResponse<CommentDto>>
{
    public Guid TodoId { get; set; }
    public string Content { get; set; } = string.Empty;
}

using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Commands.Comments;

public class DeleteCommentCommand : IRequest<ApiResponse<bool>>
{
    public Guid TodoId { get; set; }
    public Guid CommentId { get; set; }
}

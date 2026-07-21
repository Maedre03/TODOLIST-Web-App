using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Commands.Attachments;

public class DeleteAttachmentCommand : IRequest<ApiResponse<bool>>
{
    public Guid TodoId { get; set; }
    public Guid AttachmentId { get; set; }
}

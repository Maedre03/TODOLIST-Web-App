using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Commands.Attachments;

public class UploadAttachmentCommand : IRequest<ApiResponse<AttachmentDto>>
{
    public Guid TodoId { get; set; }
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

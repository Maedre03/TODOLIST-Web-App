using MediatR;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Todos.Commands.UpdateSubTask;

public class UpdateSubTaskCommand : IRequest<SubTaskDto>
{
    public Guid TodoId { get; set; }
    public Guid SubTaskId { get; set; }
    public string Title { get; set; } = string.Empty;
}

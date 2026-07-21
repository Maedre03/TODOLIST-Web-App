using MediatR;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Todos.Commands.AddSubTask;

public class AddSubTaskCommand : IRequest<SubTaskDto>
{
    public Guid TodoId { get; set; }
    public string Title { get; set; } = string.Empty;
}

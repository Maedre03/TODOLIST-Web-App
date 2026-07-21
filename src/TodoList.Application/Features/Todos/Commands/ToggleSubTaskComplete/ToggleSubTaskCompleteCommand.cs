using MediatR;

namespace TodoList.Application.Features.Todos.Commands.ToggleSubTaskComplete;

public class ToggleSubTaskCompleteCommand : IRequest
{
    public Guid TodoId { get; set; }
    public Guid SubTaskId { get; set; }
}

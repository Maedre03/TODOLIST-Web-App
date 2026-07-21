using MediatR;

namespace TodoList.Application.Features.Todos.Commands.DeleteSubTask;

public class DeleteSubTaskCommand : IRequest
{
    public Guid TodoId { get; set; }
    public Guid SubTaskId { get; set; }
}

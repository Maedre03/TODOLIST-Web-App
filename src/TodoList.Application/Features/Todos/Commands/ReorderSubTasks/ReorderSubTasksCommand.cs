using MediatR;

namespace TodoList.Application.Features.Todos.Commands.ReorderSubTasks;

public class ReorderSubTasksCommand : IRequest
{
    public Guid TodoId { get; set; }
    public List<Guid> SubTaskIds { get; set; } = new();
}

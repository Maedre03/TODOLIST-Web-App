using System.Text;
using MediatR;
using TodoList.Domain.Repositories;
using TodoList.Application.Common.Interfaces;

namespace TodoList.Application.Features.Todos.Queries.ExportTodos;

public class ExportTodosQueryHandler : IRequestHandler<ExportTodosQuery, byte[]>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ICurrentUserService _currentUserService;

    public ExportTodosQueryHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
    }

    public async Task<byte[]> Handle(ExportTodosQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == Guid.Empty)
            throw new UnauthorizedAccessException();

        var todos = await _todoRepository.GetByUserIdAsync(userId, cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("Id,Title,Description,IsCompleted,Priority,DueDate,CreatedAt");

        foreach (var todo in todos)
        {
            var title = todo.Title.Replace(",", " ").Replace("\n", " ");
            var description = todo.Description?.Replace(",", " ").Replace("\n", " ") ?? "";
            builder.AppendLine($"{todo.Id},{title},{description},{todo.IsCompleted},{(int)todo.Priority},{todo.DueDate:yyyy-MM-dd HH:mm:ss},{todo.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetBytes(builder.ToString());
    }
}

using MediatR;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Commands.ImportTodos;

public class ImportTodosCommand : IRequest<ApiResponse<int>>
{
    public string CsvContent { get; set; } = string.Empty;
}

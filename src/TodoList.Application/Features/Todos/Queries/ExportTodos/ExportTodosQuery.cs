using MediatR;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Queries.ExportTodos;

public class ExportTodosQuery : IRequest<byte[]>
{
}

using MediatR;
using System.Collections.Generic;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Todos.Queries.GetAllTodos;

/// <summary>
/// Query to get all Todo items for the current user.
/// </summary>
public record GetAllTodosQuery : IRequest<IReadOnlyList<TodoDto>>;

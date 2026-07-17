using System;
using MediatR;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Todos.Queries.GetTodoById;

/// <summary>
/// Query to get a specific Todo item by its ID.
/// </summary>
public record GetTodoByIdQuery(Guid Id) : IRequest<TodoDto>;

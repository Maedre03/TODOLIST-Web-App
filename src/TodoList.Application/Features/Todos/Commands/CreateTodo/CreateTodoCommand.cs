using System;
using MediatR;
using TodoList.Domain.Enums;

namespace TodoList.Application.Features.Todos.Commands.CreateTodo;

/// <summary>
/// Command to create a new Todo item.
/// </summary>
public record CreateTodoCommand(
    string Title,
    string Description,
    Priority Priority,
    DateTime? DueDate,
    List<Guid>? TagIds = null) : IRequest<Guid>;

using System;
using MediatR;
using TodoList.Domain.Enums;

namespace TodoList.Application.Features.Todos.Commands.UpdateTodo;

/// <summary>
/// Command to update an existing Todo item.
/// </summary>
public record UpdateTodoCommand(
    Guid Id,
    string Title,
    string Description,
    Priority Priority,
    DateTime? DueDate) : IRequest<Unit>;

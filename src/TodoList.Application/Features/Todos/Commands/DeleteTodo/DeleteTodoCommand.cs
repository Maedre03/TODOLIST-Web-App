using System;
using MediatR;

namespace TodoList.Application.Features.Todos.Commands.DeleteTodo;

/// <summary>
/// Command to delete a Todo item.
/// </summary>
public record DeleteTodoCommand(Guid Id) : IRequest<Unit>;

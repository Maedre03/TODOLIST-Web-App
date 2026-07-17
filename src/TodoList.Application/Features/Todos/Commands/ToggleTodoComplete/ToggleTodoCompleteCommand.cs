using System;
using MediatR;

namespace TodoList.Application.Features.Todos.Commands.ToggleTodoComplete;

/// <summary>
/// Command to toggle the completion status of a Todo item.
/// </summary>
public record ToggleTodoCompleteCommand(Guid Id) : IRequest<Unit>;

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.ToggleTodoComplete;

/// <summary>
/// Handles the ToggleTodoCompleteCommand by flipping the IsCompleted flag.
/// </summary>
public class ToggleTodoCompleteCommandHandler : IRequestHandler<ToggleTodoCompleteCommand, Unit>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ToggleTodoCompleteCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(ToggleTodoCompleteCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAndUserAsync(request.Id, _currentUserService.UserId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        // Toggle the status
        todo.IsCompleted = !todo.IsCompleted;
        
        _todoRepository.Update(todo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

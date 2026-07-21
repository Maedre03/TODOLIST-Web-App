using MediatR;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.DeleteSubTask;

public class DeleteSubTaskCommandHandler : IRequestHandler<DeleteSubTaskCommand>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteSubTaskCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteSubTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var todo = await _todoRepository.GetByIdAndUserAsync(request.TodoId, userId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.TodoId);
        }

        var subTask = todo.SubTasks.FirstOrDefault(s => s.Id == request.SubTaskId);
        if (subTask == null)
        {
            throw new TodoNotFoundException(request.SubTaskId);
        }

        todo.SubTasks.Remove(subTask);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

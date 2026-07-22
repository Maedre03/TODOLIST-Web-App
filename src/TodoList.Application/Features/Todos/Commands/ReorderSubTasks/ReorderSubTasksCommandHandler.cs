using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.ReorderSubTasks;

public class ReorderSubTasksCommandHandler : IRequestHandler<ReorderSubTasksCommand>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ReorderSubTasksCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(ReorderSubTasksCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var todo = await _todoRepository.GetByIdAndUserAsync(request.TodoId, userId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.TodoId);
        }

        // Assign DisplayOrder based on the index in the incoming array
        for (int i = 0; i < request.SubTaskIds.Count; i++)
        {
            var id = request.SubTaskIds[i];
            var subTask = todo.SubTasks.FirstOrDefault(s => s.Id == id);
            
            if (subTask != null)
            {
                subTask.DisplayOrder = i;
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

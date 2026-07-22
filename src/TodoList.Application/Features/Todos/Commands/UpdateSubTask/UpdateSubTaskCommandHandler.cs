using AutoMapper;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.UpdateSubTask;

public class UpdateSubTaskCommandHandler : IRequestHandler<UpdateSubTaskCommand, SubTaskDto>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateSubTaskCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<SubTaskDto> Handle(UpdateSubTaskCommand request, CancellationToken cancellationToken)
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
            throw new SubTaskNotFoundException(request.SubTaskId);
        }

        subTask.Title = request.Title;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SubTaskDto>(subTask);
    }
}

using AutoMapper;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.AddSubTask;

public class AddSubTaskCommandHandler : IRequestHandler<AddSubTaskCommand, SubTaskDto>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public AddSubTaskCommandHandler(
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

    public async Task<SubTaskDto> Handle(AddSubTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var todo = await _todoRepository.GetByIdAndUserAsync(request.TodoId, userId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.TodoId);
        }

        // Calculate the next display order
        int nextOrder = todo.SubTasks.Any() ? todo.SubTasks.Max(s => s.DisplayOrder) + 1 : 0;
        
        var subTask = new SubTask(request.Title, request.TodoId, nextOrder);
        
        _todoRepository.AddSubTask(subTask);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<SubTaskDto>(subTask);
    }
}

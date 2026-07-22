using AutoMapper;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Queries.GetTodoById;

/// <summary>
/// Handler for getting a Todo item by ID.
/// </summary>
public class GetTodoByIdQueryHandler : IRequestHandler<GetTodoByIdQuery, TodoDto>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetTodoByIdQueryHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService, IMapper mapper)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TodoDto> Handle(GetTodoByIdQuery request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAndUserAsync(request.Id, _currentUserService.UserId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        return _mapper.Map<TodoDto>(todo);
    }
}

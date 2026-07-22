using AutoMapper;
using MediatR;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Queries.GetAllTodos;

/// <summary>
/// Handler for getting all Todo items.
/// </summary>
public class GetAllTodosQueryHandler : IRequestHandler<GetAllTodosQuery, IReadOnlyList<TodoDto>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetAllTodosQueryHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService, IMapper mapper)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<TodoDto>> Handle(GetAllTodosQuery request, CancellationToken cancellationToken)
    {
        var todos = await _todoRepository.GetByUserIdAsync(_currentUserService.UserId, cancellationToken);

        return _mapper.Map<List<TodoDto>>(todos);
    }
}

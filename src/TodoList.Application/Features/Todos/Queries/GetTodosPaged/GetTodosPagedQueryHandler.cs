using AutoMapper;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Common.Models;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Queries.GetTodosPaged;

/// <summary>
/// Handler for getting paginated Todo items.
/// </summary>
public class GetTodosPagedQueryHandler : IRequestHandler<GetTodosPagedQuery, PaginatedList<TodoDto>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetTodosPagedQueryHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService, IMapper mapper)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<PaginatedList<TodoDto>> Handle(GetTodosPagedQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _todoRepository.GetPagedByUserIdAsync(
            _currentUserService.UserId,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.SortBy,
            request.SortDescending,
            request.IsCompleted,
            request.StartDate,
            request.EndDate,
            request.TagId,
            cancellationToken);

        var dtoItems = _mapper.Map<List<TodoDto>>(items);

        return new PaginatedList<TodoDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }
}

using System.Linq;
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

    public GetTodosPagedQueryHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
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

        var dtoItems = items.Select(t => new TodoDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            IsCompleted = t.IsCompleted,
            Priority = t.Priority,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt,
            Tags = t.Tags.Select(tag => new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                Color = tag.Color
            }).ToList()
        }).ToList();

        return new PaginatedList<TodoDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }
}

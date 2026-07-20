using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;

namespace TodoList.Application.Features.Todos.Queries.GetTodosPaged;

/// <summary>
/// Query to get paginated Todo items for the current user.
/// </summary>
public record GetTodosPagedQuery : IRequest<PaginatedList<TodoDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
    public bool? IsCompleted { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

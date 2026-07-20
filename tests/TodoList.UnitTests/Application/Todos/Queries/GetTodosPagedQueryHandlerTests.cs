using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Queries.GetTodosPaged;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Queries;

public class GetTodosPagedQueryHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly GetTodosPagedQueryHandler _handler;

    public GetTodosPagedQueryHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new GetTodosPagedQueryHandler(_todoRepositoryMock, _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldReturnPaginatedList_WithCorrectMetadata()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var query = new GetTodosPagedQuery
        {
            PageNumber = 2,
            PageSize = 5,
            SearchTerm = "test",
            SortBy = "Title",
            SortDescending = true
        };

        var todos = new List<Todo>
        {
            new Todo("Test 1", "Desc", Priority.High, null, userId),
            new Todo("Test 2", "Desc", Priority.Low, null, userId)
        };
        var totalCount = 12;

        _todoRepositoryMock.GetPagedByUserIdAsync(
                userId, query.PageNumber, query.PageSize, query.SearchTerm, query.SortBy, query.SortDescending, query.IsCompleted, query.StartDate, query.EndDate, query.TagId, Arg.Any<CancellationToken>())
            .Returns((todos, totalCount));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(12);
        result.PageNumber.Should().Be(2);
        result.TotalPages.Should().Be(3); // 12 / 5 = 2.4 -> Math.Ceiling -> 3
        result.HasPreviousPage.Should().BeTrue();
        result.HasNextPage.Should().BeTrue();
    }
}

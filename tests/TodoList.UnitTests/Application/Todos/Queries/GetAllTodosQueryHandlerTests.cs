using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Queries.GetAllTodos;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Queries;

public class GetAllTodosQueryHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly GetAllTodosQueryHandler _handler;

    public GetAllTodosQueryHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new GetAllTodosQueryHandler(_todoRepositoryMock, _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldReturnListOfTodoDtos_BelongingToCurrentUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var todos = new List<Todo>
        {
            new Todo("Title 1", "Desc 1", Priority.High, null, userId),
            new Todo("Title 2", "Desc 2", Priority.Low, null, userId)
        };

        _todoRepositoryMock.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(todos);

        var query = new GetAllTodosQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        
        result[0].Title.Should().Be("Title 1");
        result[1].Title.Should().Be("Title 2");
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenUserHasNoTodos()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        _todoRepositoryMock.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Todo>());

        var query = new GetAllTodosQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}

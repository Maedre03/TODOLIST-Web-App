using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Queries.GetTodoById;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Queries;

public class GetTodoByIdQueryHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly GetTodoByIdQueryHandler _handler;

    public GetTodoByIdQueryHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new GetTodoByIdQueryHandler(_todoRepositoryMock, _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldReturnTodoDto_WhenTodoExistsAndBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);
        
        var todoId = Guid.NewGuid();
        var todo = new Todo("Test", "Desc", Priority.Medium, null, userId);
        
        _todoRepositoryMock.GetByIdAndUserAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns(todo);

        var query = new GetTodoByIdQuery(todoId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Test");
        result.Priority.Should().Be(Priority.Medium);
    }

    [Fact]
    public async Task Handle_ShouldThrowTodoNotFoundException_WhenTodoDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);
        var todoId = Guid.NewGuid();

        _todoRepositoryMock.GetByIdAndUserAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns((Todo?)null);

        var query = new GetTodoByIdQuery(todoId);

        // Act
        Func<Task> act = async () => await _handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<TodoNotFoundException>();
    }
}

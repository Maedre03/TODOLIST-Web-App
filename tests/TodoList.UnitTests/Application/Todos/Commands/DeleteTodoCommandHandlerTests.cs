using FluentAssertions;
using MediatR;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Commands.DeleteTodo;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class DeleteTodoCommandHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly DeleteTodoCommandHandler _handler;

    public DeleteTodoCommandHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new DeleteTodoCommandHandler(
            _todoRepositoryMock,
            _unitOfWorkMock,
            _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldDeleteTodo_WhenTodoExistsAndBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var todoId = Guid.NewGuid();
        var existingTodo = new Todo("Title", "Desc", Priority.Low, null, userId);
        
        _todoRepositoryMock.GetByIdAsync(todoId, Arg.Any<CancellationToken>())
            .Returns(existingTodo);

        var command = new DeleteTodoCommand(todoId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        
        _todoRepositoryMock.Received(1).Delete(existingTodo);
        await _unitOfWorkMock.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldThrowTodoNotFoundException_WhenTodoDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);
        var todoId = Guid.NewGuid();

        _todoRepositoryMock.GetByIdAsync(todoId, Arg.Any<CancellationToken>())
            .Returns((Todo?)null);

        var command = new DeleteTodoCommand(todoId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<TodoNotFoundException>();

        _todoRepositoryMock.DidNotReceive().Delete(Arg.Any<Todo>());
        await _unitOfWorkMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedTodoAccessException_WhenTodoBelongsToAnotherUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);
        
        var ownerId = Guid.NewGuid();
        var todoId = Guid.NewGuid();
        var existingTodo = new Todo("Title", "Desc", Priority.Low, null, ownerId); // Belongs to ownerId

        _todoRepositoryMock.GetByIdAsync(todoId, Arg.Any<CancellationToken>())
            .Returns(existingTodo);

        var command = new DeleteTodoCommand(todoId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedTodoAccessException>();

        _todoRepositoryMock.DidNotReceive().Delete(Arg.Any<Todo>());
        await _unitOfWorkMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}

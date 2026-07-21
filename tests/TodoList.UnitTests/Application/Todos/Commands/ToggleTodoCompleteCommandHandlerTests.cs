using FluentAssertions;
using MediatR;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Commands.ToggleTodoComplete;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class ToggleTodoCompleteCommandHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly IMediator _mediatorMock;
    private readonly ToggleTodoCompleteCommandHandler _handler;

    public ToggleTodoCompleteCommandHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();
        _mediatorMock = Substitute.For<IMediator>();

        _handler = new ToggleTodoCompleteCommandHandler(
            _todoRepositoryMock,
            _unitOfWorkMock,
            _currentUserServiceMock,
            _mediatorMock);
    }

    [Fact]
    public async Task Handle_ShouldToggleTodoCompleteStatus_WhenTodoExistsAndBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var todoId = Guid.NewGuid();
        var existingTodo = new Todo("Title", "Desc", Priority.Low, null, userId);
        var initialStatus = existingTodo.IsCompleted;
        
        _todoRepositoryMock.GetByIdAndUserAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns(existingTodo);

        var command = new ToggleTodoCompleteCommand(todoId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        existingTodo.IsCompleted.Should().NotBe(initialStatus);
        
        _todoRepositoryMock.Received(1).Update(existingTodo);
        await _unitOfWorkMock.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
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

        var command = new ToggleTodoCompleteCommand(todoId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<TodoNotFoundException>();

        _todoRepositoryMock.DidNotReceive().Update(Arg.Any<Todo>());
        await _unitOfWorkMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}

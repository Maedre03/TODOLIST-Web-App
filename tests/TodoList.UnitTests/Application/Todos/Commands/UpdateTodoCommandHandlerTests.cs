using FluentAssertions;
using MediatR;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Commands.UpdateTodo;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class UpdateTodoCommandHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly ITagRepository _tagRepositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly UpdateTodoCommandHandler _handler;

    public UpdateTodoCommandHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _tagRepositoryMock = Substitute.For<ITagRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new UpdateTodoCommandHandler(
            _todoRepositoryMock,
            _tagRepositoryMock,
            _unitOfWorkMock,
            _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldUpdateTodo_WhenTodoExistsAndBelongsToUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var todoId = Guid.NewGuid();
        var existingTodo = new Todo("Old Title", "Old Desc", Priority.Low, null, userId);
        
        _todoRepositoryMock.GetByIdAndUserAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns(existingTodo);

        var command = new UpdateTodoCommand(
            todoId,
            "New Title",
            "New Desc",
            Priority.High,
            DateTime.UtcNow.AddDays(2)
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        
        existingTodo.Title.Should().Be(command.Title);
        existingTodo.Description.Should().Be(command.Description);
        existingTodo.Priority.Should().Be(command.Priority);
        existingTodo.DueDate.Should().Be(command.DueDate);

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

        var command = new UpdateTodoCommand(todoId, "Test", "", Priority.Medium, null);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<TodoNotFoundException>();

        _todoRepositoryMock.DidNotReceive().Update(Arg.Any<Todo>());
        await _unitOfWorkMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}

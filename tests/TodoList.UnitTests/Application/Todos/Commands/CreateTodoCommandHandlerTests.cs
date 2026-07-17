using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Todos.Commands.CreateTodo;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class CreateTodoCommandHandlerTests
{
    private readonly ITodoRepository _todoRepositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly ICurrentUserService _currentUserServiceMock;
    private readonly CreateTodoCommandHandler _handler;

    public CreateTodoCommandHandlerTests()
    {
        _todoRepositoryMock = Substitute.For<ITodoRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _currentUserServiceMock = Substitute.For<ICurrentUserService>();

        _handler = new CreateTodoCommandHandler(
            _todoRepositoryMock,
            _unitOfWorkMock,
            _currentUserServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldCreateTodo_AndSaveToDatabase()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _currentUserServiceMock.UserId.Returns(userId);

        var command = new CreateTodoCommand(
            "Test Todo",
            "Test Description",
            Priority.High,
            DateTime.UtcNow.AddDays(1)
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();

        await _todoRepositoryMock.Received(1).AddAsync(
            Arg.Is<Todo>(t => 
                t.Title == command.Title &&
                t.Description == command.Description &&
                t.Priority == command.Priority &&
                t.DueDate == command.DueDate &&
                t.CreatedByUserId == userId), 
            Arg.Any<CancellationToken>());

        await _unitOfWorkMock.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}

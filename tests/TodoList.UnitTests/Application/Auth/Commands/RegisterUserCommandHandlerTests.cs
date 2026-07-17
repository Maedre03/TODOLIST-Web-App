using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Auth.Commands.RegisterUser;
using TodoList.Domain.Entities;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Auth.Commands;

public class RegisterUserCommandHandlerTests
{
    private readonly IUserRepository _userRepositoryMock;
    private readonly IUnitOfWork _unitOfWorkMock;
    private readonly IPasswordHasher _passwordHasherMock;
    private readonly RegisterUserCommandHandler _handler;

    public RegisterUserCommandHandlerTests()
    {
        _userRepositoryMock = Substitute.For<IUserRepository>();
        _unitOfWorkMock = Substitute.For<IUnitOfWork>();
        _passwordHasherMock = Substitute.For<IPasswordHasher>();

        _handler = new RegisterUserCommandHandler(
            _userRepositoryMock,
            _unitOfWorkMock,
            _passwordHasherMock);
    }

    [Fact]
    public async Task Handle_ShouldRegisterUser_WhenEmailIsUnique()
    {
        // Arrange
        var command = new RegisterUserCommand("newuser", "new@example.com", "password123");
        
        _userRepositoryMock.IsEmailUniqueAsync(command.Email, Arg.Any<CancellationToken>())
            .Returns(true);
            
        _passwordHasherMock.HashPassword(command.Password).Returns("hashed_password");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();

        await _userRepositoryMock.Received(1).AddAsync(
            Arg.Is<User>(u => 
                u.Username == command.Username && 
                u.Email == command.Email && 
                u.PasswordHash == "hashed_password"),
            Arg.Any<CancellationToken>());
            
        await _unitOfWorkMock.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldThrowEmailAlreadyInUseException_WhenEmailIsNotUnique()
    {
        // Arrange
        var command = new RegisterUserCommand("existinguser", "existing@example.com", "password123");
        
        _userRepositoryMock.IsEmailUniqueAsync(command.Email, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<EmailAlreadyInUseException>();

        await _userRepositoryMock.DidNotReceive().AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        await _unitOfWorkMock.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}

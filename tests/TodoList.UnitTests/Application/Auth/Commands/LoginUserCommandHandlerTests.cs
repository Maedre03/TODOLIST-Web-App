using FluentAssertions;
using NSubstitute;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Features.Auth.Commands.LoginUser;
using TodoList.Domain.Entities;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.UnitTests.Application.Auth.Commands;

public class LoginUserCommandHandlerTests
{
    private readonly IUserRepository _userRepositoryMock;
    private readonly IPasswordHasher _passwordHasherMock;
    private readonly IJwtTokenService _jwtTokenServiceMock;
    private readonly LoginUserCommandHandler _handler;

    public LoginUserCommandHandlerTests()
    {
        _userRepositoryMock = Substitute.For<IUserRepository>();
        _passwordHasherMock = Substitute.For<IPasswordHasher>();
        _jwtTokenServiceMock = Substitute.For<IJwtTokenService>();

        _handler = new LoginUserCommandHandler(
            _userRepositoryMock,
            _passwordHasherMock,
            _jwtTokenServiceMock);
    }

    [Fact]
    public async Task Handle_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var command = new LoginUserCommand("test@example.com", "password123");
        var user = new User("test", command.Email, "hashed_password");
        
        _userRepositoryMock.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>())
            .Returns(user);
            
        _passwordHasherMock.VerifyPassword(command.Password, user.PasswordHash)
            .Returns(true);
            
        var expectedToken = "valid_jwt_token";
        _jwtTokenServiceMock.GenerateToken(user).Returns(expectedToken);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(expectedToken);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidCredentialsException_WhenUserNotFound()
    {
        // Arrange
        var command = new LoginUserCommand("test@example.com", "password123");
        
        _userRepositoryMock.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>())
            .Returns((User?)null);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidCredentialsException_WhenPasswordIsIncorrect()
    {
        // Arrange
        var command = new LoginUserCommand("test@example.com", "wrongpassword");
        var user = new User("test", command.Email, "hashed_password");
        
        _userRepositoryMock.GetByEmailAsync(command.Email, Arg.Any<CancellationToken>())
            .Returns(user);
            
        _passwordHasherMock.VerifyPassword(command.Password, user.PasswordHash)
            .Returns(false);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }
}

using FluentAssertions;
using TodoList.Domain.Entities;

namespace TodoList.UnitTests.Domain;

public class UserTests
{
    [Fact]
    public void Constructor_ShouldInitializeUser_WithGivenValuesAndDefaultState()
    {
        // Arrange
        var username = "testuser";
        var email = "test@example.com";
        var passwordHash = "hashedpassword123";

        // Act
        var user = new User(username, email, passwordHash);

        // Assert
        user.Id.Should().NotBeEmpty();
        user.Username.Should().Be(username);
        user.Email.Should().Be(email);
        user.PasswordHash.Should().Be(passwordHash);
        
        user.Todos.Should().BeEmpty();
        user.IsDeleted.Should().BeFalse();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.DomainEvents.Should().BeEmpty();
    }
}

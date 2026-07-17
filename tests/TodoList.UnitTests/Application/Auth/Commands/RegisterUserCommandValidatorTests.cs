using FluentValidation.TestHelper;
using TodoList.Application.Features.Auth.Commands.RegisterUser;

namespace TodoList.UnitTests.Application.Auth.Commands;

public class RegisterUserCommandValidatorTests
{
    private readonly RegisterUserCommandValidator _validator;

    public RegisterUserCommandValidatorTests()
    {
        _validator = new RegisterUserCommandValidator();
    }

    [Fact]
    public void Should_HaveError_When_UsernameIsEmpty()
    {
        var model = new RegisterUserCommand(string.Empty, "test@test.com", "password123");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_HaveError_When_UsernameIsTooShort()
    {
        var model = new RegisterUserCommand("ab", "test@test.com", "password123");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_HaveError_When_UsernameIsTooLong()
    {
        var model = new RegisterUserCommand(new string('a', 51), "test@test.com", "password123");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_HaveError_When_EmailIsEmpty()
    {
        var model = new RegisterUserCommand("username", string.Empty, "password123");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_HaveError_When_EmailIsInvalid()
    {
        var model = new RegisterUserCommand("username", "not-an-email", "password123");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_HaveError_When_PasswordIsEmpty()
    {
        var model = new RegisterUserCommand("username", "test@test.com", string.Empty);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_HaveError_When_PasswordIsTooShort()
    {
        var model = new RegisterUserCommand("username", "test@test.com", "12345");
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}

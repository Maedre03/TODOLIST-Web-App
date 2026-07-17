using FluentValidation;
using FluentValidation.Results;
using MediatR;
using NSubstitute;
using TodoList.Application.Common.Behaviors;
using TodoList.Application.Common.Exceptions;
using Xunit;

namespace TodoList.UnitTests.Application.Common.Behaviors;

public class ValidationBehaviorTests
{
    public class TestRequest : IRequest<string>
    {
        public string Name { get; set; } = string.Empty;
    }

    [Fact]
    public async Task Handle_WithNoValidators_ShouldReturnNext()
    {
        // Arrange
        var validators = Enumerable.Empty<IValidator<TestRequest>>();
        var behavior = new ValidationBehavior<TestRequest, string>(validators);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next().Returns(Task.FromResult("Success"));

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Success", result);
        await next.Received(1)();
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldReturnNext()
    {
        // Arrange
        var validator = Substitute.For<IValidator<TestRequest>>();
        validator.ValidateAsync(Arg.Any<ValidationContext<TestRequest>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new ValidationResult()));

        var validators = new List<IValidator<TestRequest>> { validator };
        var behavior = new ValidationBehavior<TestRequest, string>(validators);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next().Returns(Task.FromResult("Success"));

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Success", result);
        await next.Received(1)();
    }

    [Fact]
    public async Task Handle_WithInvalidRequest_ShouldThrowValidationException()
    {
        // Arrange
        var validator = Substitute.For<IValidator<TestRequest>>();
        var failures = new List<ValidationFailure> { new ValidationFailure("Name", "Name is required") };
        validator.ValidateAsync(Arg.Any<ValidationContext<TestRequest>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new ValidationResult(failures)));

        var validators = new List<IValidator<TestRequest>> { validator };
        var behavior = new ValidationBehavior<TestRequest, string>(validators);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();

        // Act & Assert
        await Assert.ThrowsAsync<TodoList.Application.Common.Exceptions.ValidationException>(
            () => behavior.Handle(request, next, CancellationToken.None));
        
        await next.DidNotReceive()();
    }
}

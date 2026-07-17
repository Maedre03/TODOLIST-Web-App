using FluentValidation.TestHelper;
using TodoList.Application.Features.Todos.Commands.CreateTodo;
using TodoList.Domain.Enums;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class CreateTodoCommandValidatorTests
{
    private readonly CreateTodoCommandValidator _validator;

    public CreateTodoCommandValidatorTests()
    {
        _validator = new CreateTodoCommandValidator();
    }

    [Fact]
    public void Should_HaveError_When_TitleIsEmpty()
    {
        var model = new CreateTodoCommand(string.Empty, "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_HaveError_When_TitleExceeds200Characters()
    {
        var model = new CreateTodoCommand(new string('a', 201), "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_NotHaveError_When_TitleIsValid()
    {
        var model = new CreateTodoCommand("Valid Title", "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_HaveError_When_DescriptionExceeds1000Characters()
    {
        var model = new CreateTodoCommand("Valid Title", new string('a', 1001), Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Fact]
    public void Should_HaveError_When_PriorityIsInvalid()
    {
        var model = new CreateTodoCommand("Valid Title", "", (Priority)99, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Priority);
    }

    [Fact]
    public void Should_HaveError_When_DueDateIsInThePast()
    {
        var model = new CreateTodoCommand("Valid Title", "", Priority.Medium, DateTime.UtcNow.AddDays(-1));
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.DueDate);
    }

    [Fact]
    public void Should_NotHaveError_When_DueDateIsInTheFuture()
    {
        var model = new CreateTodoCommand("Valid Title", "", Priority.Medium, DateTime.UtcNow.AddDays(1));
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveValidationErrorFor(x => x.DueDate);
    }
}

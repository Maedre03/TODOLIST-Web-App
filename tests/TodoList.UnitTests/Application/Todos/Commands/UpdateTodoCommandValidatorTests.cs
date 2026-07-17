using FluentValidation.TestHelper;
using TodoList.Application.Features.Todos.Commands.UpdateTodo;
using TodoList.Domain.Enums;

namespace TodoList.UnitTests.Application.Todos.Commands;

public class UpdateTodoCommandValidatorTests
{
    private readonly UpdateTodoCommandValidator _validator;

    public UpdateTodoCommandValidatorTests()
    {
        _validator = new UpdateTodoCommandValidator();
    }

    [Fact]
    public void Should_HaveError_When_IdIsEmpty()
    {
        var model = new UpdateTodoCommand(Guid.Empty, "Valid Title", "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void Should_HaveError_When_TitleIsEmpty()
    {
        var model = new UpdateTodoCommand(Guid.NewGuid(), string.Empty, "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_HaveError_When_TitleExceeds200Characters()
    {
        var model = new UpdateTodoCommand(Guid.NewGuid(), new string('a', 201), "", Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_HaveError_When_DescriptionExceeds1000Characters()
    {
        var model = new UpdateTodoCommand(Guid.NewGuid(), "Valid Title", new string('a', 1001), Priority.Medium, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }

    [Fact]
    public void Should_HaveError_When_PriorityIsInvalid()
    {
        var model = new UpdateTodoCommand(Guid.NewGuid(), "Valid Title", "", (Priority)99, null);
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Priority);
    }

    [Fact]
    public void Should_HaveError_When_DueDateIsInThePast()
    {
        var model = new UpdateTodoCommand(Guid.NewGuid(), "Valid Title", "", Priority.Medium, DateTime.UtcNow.AddDays(-1));
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.DueDate);
    }
}

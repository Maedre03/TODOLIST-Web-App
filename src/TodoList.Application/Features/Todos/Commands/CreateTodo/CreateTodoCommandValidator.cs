using System;
using FluentValidation;

namespace TodoList.Application.Features.Todos.Commands.CreateTodo;

/// <summary>
/// Validator for CreateTodoCommand.
/// </summary>
public class CreateTodoCommandValidator : AbstractValidator<CreateTodoCommand>
{
    public CreateTodoCommandValidator()
    {
        RuleFor(v => v.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(v => v.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(v => v.Priority)
            .IsInEnum().WithMessage("Invalid priority value.");

        RuleFor(v => v.DueDate)
            .GreaterThan(DateTime.UtcNow).WithMessage("Due date cannot be in the past.")
            .When(v => v.DueDate.HasValue);
    }
}

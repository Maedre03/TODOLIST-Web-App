using FluentValidation;

namespace TodoList.Application.Features.Todos.Commands.AddSubTask;

public class AddSubTaskCommandValidator : AbstractValidator<AddSubTaskCommand>
{
    public AddSubTaskCommandValidator()
    {
        RuleFor(v => v.TodoId)
            .NotEmpty().WithMessage("TodoId is required.");

        RuleFor(v => v.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");
    }
}

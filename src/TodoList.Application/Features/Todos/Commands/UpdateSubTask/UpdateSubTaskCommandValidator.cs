using FluentValidation;

namespace TodoList.Application.Features.Todos.Commands.UpdateSubTask;

public class UpdateSubTaskCommandValidator : AbstractValidator<UpdateSubTaskCommand>
{
    public UpdateSubTaskCommandValidator()
    {
        RuleFor(v => v.TodoId)
            .NotEmpty().WithMessage("TodoId is required.");

        RuleFor(v => v.SubTaskId)
            .NotEmpty().WithMessage("SubTaskId is required.");

        RuleFor(v => v.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");
    }
}

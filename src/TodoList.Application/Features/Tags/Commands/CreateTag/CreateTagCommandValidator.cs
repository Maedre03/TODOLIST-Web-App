using FluentValidation;

namespace TodoList.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommandValidator : AbstractValidator<CreateTagCommand>
{
    public CreateTagCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(50).WithMessage("Name must not exceed 50 characters.");

        RuleFor(v => v.Color)
            .NotEmpty().WithMessage("Color is required.")
            .MaximumLength(20).WithMessage("Color must not exceed 20 characters.");
    }
}

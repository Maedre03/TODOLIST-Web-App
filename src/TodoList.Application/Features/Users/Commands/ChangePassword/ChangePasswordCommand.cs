using MediatR;

namespace TodoList.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommand : IRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

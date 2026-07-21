using MediatR;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Users.Commands.UpdateUserProfile;

public class UpdateUserProfileCommand : IRequest<UserProfileDto>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

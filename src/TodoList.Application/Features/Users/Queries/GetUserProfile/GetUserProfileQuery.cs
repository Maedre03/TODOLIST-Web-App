using MediatR;
using TodoList.Application.Common.DTOs;

namespace TodoList.Application.Features.Users.Queries.GetUserProfile;

public class GetUserProfileQuery : IRequest<UserProfileDto>
{
}

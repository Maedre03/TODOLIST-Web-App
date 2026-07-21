using AutoMapper;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Users.Queries.GetUserProfile;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetUserProfileQueryHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        return _mapper.Map<UserProfileDto>(user);
    }
}

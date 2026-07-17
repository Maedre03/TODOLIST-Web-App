using MediatR;

namespace TodoList.Application.Features.Auth.Commands.LoginUser;

/// <summary>
/// Command to authenticate a user. Returns a JWT token if successful.
/// </summary>
public record LoginUserCommand(string Email, string Password) : IRequest<string>;

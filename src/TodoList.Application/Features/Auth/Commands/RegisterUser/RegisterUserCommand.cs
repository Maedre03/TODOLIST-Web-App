using System;
using MediatR;

namespace TodoList.Application.Features.Auth.Commands.RegisterUser;

/// <summary>
/// Command to register a new user in the system.
/// </summary>
public record RegisterUserCommand(string Username, string Email, string Password) : IRequest<Guid>;

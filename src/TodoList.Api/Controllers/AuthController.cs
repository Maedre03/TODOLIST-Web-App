using MediatR;
using Microsoft.AspNetCore.Mvc;
using TodoList.Application.Features.Auth.Commands.LoginUser;
using TodoList.Application.Features.Auth.Commands.RegisterUser;

namespace TodoList.Api.Controllers;

/// <summary>
/// Handles authentication and user registration endpoints.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var userId = await _mediator.Send(command);
        return Created(string.Empty, new { Id = userId });
    }

    /// <summary>
    /// Logs in a user and returns a JWT token.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
    {
        var token = await _mediator.Send(command);
        return Ok(new { Token = token });
    }
}

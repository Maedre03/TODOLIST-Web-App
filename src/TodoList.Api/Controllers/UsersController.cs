using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Application.Features.Users.Commands.ChangePassword;
using TodoList.Application.Features.Users.Commands.DeleteAccount;
using TodoList.Application.Features.Users.Commands.UpdateUserProfile;
using TodoList.Application.Features.Users.Queries.GetUserProfile;

namespace TodoList.Api.Controllers;

/// <summary>
/// Handles user profile and account operations.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets the current user's profile.
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var result = await _mediator.Send(new GetUserProfileQuery());
        return Ok(result);
    }

    /// <summary>
    /// Updates the current user's profile information.
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Changes the current user's password.
    /// </summary>
    [HttpPut("me/password")]
    public async Task<IActionResult> ChangeMyPassword([FromBody] ChangePasswordCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Deletes the current user's account.
    /// </summary>
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMyAccount()
    {
        await _mediator.Send(new DeleteAccountCommand());
        return NoContent();
    }
}

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Application.Features.Tags.Commands.CreateTag;
using TodoList.Application.Features.Tags.Commands.DeleteTag;
using TodoList.Application.Features.Tags.Queries.GetAllTags;

namespace TodoList.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TagsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TagsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllTagsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTagCommand command)
    {
        var id = await _mediator.Send(command);
        // Assuming we want to return a simplified response instead of CreatedAtAction
        // since we don't have a GetTagById endpoint right now.
        return Ok(new { Id = id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteTagCommand(id));
        return NoContent();
    }
}

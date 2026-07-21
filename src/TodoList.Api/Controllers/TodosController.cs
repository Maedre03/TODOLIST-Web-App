using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Features.Todos.Commands.CreateTodo;
using TodoList.Application.Features.Todos.Commands.DeleteTodo;
using TodoList.Application.Features.Todos.Commands.ToggleTodoComplete;
using TodoList.Application.Features.Todos.Commands.UpdateTodo;
using TodoList.Application.Features.Todos.Queries.GetAllTodos;
using TodoList.Application.Features.Todos.Queries.GetTodoById;
using TodoList.Application.Features.Todos.Queries.GetTodosPaged;
using TodoList.Application.Features.Todos.Commands.AddSubTask;
using TodoList.Application.Features.Todos.Commands.DeleteSubTask;
using TodoList.Application.Features.Todos.Commands.ToggleSubTaskComplete;

namespace TodoList.Api.Controllers;

/// <summary>
/// Handles CRUD operations for Todos.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class TodosController : ControllerBase
{
    private readonly IMediator _mediator;

    public TodosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Gets all todos for the current user.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllTodosQuery());
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific todo by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetTodoByIdQuery(id));
        return Ok(result);
    }

    /// <summary>
    /// Gets a paginated list of todos with optional filtering and sorting.
    /// </summary>
    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null, 
        [FromQuery] string? sortBy = null, 
        [FromQuery] bool sortDescending = false,
        [FromQuery] bool? isCompleted = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] Guid? tagId = null)
    {
        var query = new GetTodosPagedQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            SortBy = sortBy,
            SortDescending = sortDescending,
            IsCompleted = isCompleted,
            StartDate = startDate,
            EndDate = endDate,
            TagId = tagId
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new todo.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoRequest request)
    {
        var command = new CreateTodoCommand(
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            request.Recurrence,
            request.TagIds
        );var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = id }, new { Id = id });
    }

    /// <summary>
    /// Updates an existing todo.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoRequest request)
    {
        var command = new UpdateTodoCommand(
            id,
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            request.Recurrence,
            request.TagIds
        );await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Deletes a todo by ID.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteTodoCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Toggles the completion status of a todo.
    /// </summary>
    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> ToggleComplete(Guid id)
    {
        await _mediator.Send(new ToggleTodoCompleteCommand(id));
        return NoContent();
    }

    /// <summary>
    /// Adds a subtask to a todo.
    /// </summary>
    [HttpPost("{id:guid}/subtasks")]
    public async Task<IActionResult> AddSubTask(Guid id, [FromBody] AddSubTaskRequest request)
    {
        var command = new AddSubTaskCommand { TodoId = id, Title = request.Title };
        var subTaskDto = await _mediator.Send(command);
        return Ok(subTaskDto);
    }

    /// <summary>
    /// Deletes a subtask from a todo.
    /// </summary>
    [HttpDelete("{id:guid}/subtasks/{subTaskId:guid}")]
    public async Task<IActionResult> DeleteSubTask(Guid id, Guid subTaskId)
    {
        await _mediator.Send(new DeleteSubTaskCommand { TodoId = id, SubTaskId = subTaskId });
        return NoContent();
    }

    /// <summary>
    /// Toggles the completion status of a subtask.
    /// </summary>
    [HttpPatch("{id:guid}/subtasks/{subTaskId:guid}/toggle")]
    public async Task<IActionResult> ToggleSubTaskComplete(Guid id, Guid subTaskId)
    {
        await _mediator.Send(new ToggleSubTaskCompleteCommand { TodoId = id, SubTaskId = subTaskId });
        return NoContent();
    }

    /// <summary>
    /// Exports all todos to a CSV file.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportTodos()
    {
        var csvBytes = await _mediator.Send(new TodoList.Application.Features.Todos.Queries.ExportTodos.ExportTodosQuery());
        return File(csvBytes, "text/csv", "todos-export.csv");
    }

    /// <summary>
    /// Imports todos from a CSV file.
    /// </summary>
    [HttpPost("import")]
    public async Task<IActionResult> ImportTodos(Microsoft.AspNetCore.Http.IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new TodoList.Application.Common.Models.ApiResponse<int> { Success = false, Message = "File is empty" });

        using var reader = new System.IO.StreamReader(file.OpenReadStream());
        var content = await reader.ReadToEndAsync();

        var command = new TodoList.Application.Features.Todos.Commands.ImportTodos.ImportTodosCommand { CsvContent = content };
        var result = await _mediator.Send(command);
        
        if (result.Success)
            return Ok(result);
            
        return BadRequest(result);
    }
}

public class AddSubTaskRequest
{
    public string Title { get; set; } = string.Empty;
}

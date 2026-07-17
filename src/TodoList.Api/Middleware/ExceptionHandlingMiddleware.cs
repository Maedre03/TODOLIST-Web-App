using System.Net;
using System.Text.Json;
using TodoList.Application.Common.Exceptions;
using TodoList.Application.Common.Models;
using TodoList.Domain.Exceptions;

namespace TodoList.Api.Middleware;

/// <summary>
/// Global exception handling middleware to catch unhandled exceptions and format them consistently.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            ValidationException => HttpStatusCode.BadRequest,
            TodoNotFoundException => HttpStatusCode.NotFound,
            UnauthorizedTodoAccessException => HttpStatusCode.Forbidden,
            EmailAlreadyInUseException => HttpStatusCode.Conflict,
            InvalidCredentialsException => HttpStatusCode.Unauthorized,
            DomainException => HttpStatusCode.BadRequest,
            _ => HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = (int)statusCode;

        var errors = exception is ValidationException validationException
            ? validationException.Errors
            : null;

        // Never expose stack trace to the client in production, use a generic message for 500s.
        var message = statusCode == HttpStatusCode.InternalServerError 
            ? "An internal server error occurred." 
            : exception.Message;

        var response = ApiResponse<object>.ErrorResponse(message, errors);

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
    }
}

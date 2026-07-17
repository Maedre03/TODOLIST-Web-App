using System.Diagnostics;

namespace TodoList.Api.Middleware;

/// <summary>
/// Middleware to log HTTP requests and their execution time.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        _logger.LogInformation("Handling request: {Method} {Path}", context.Request.Method, context.Request.Path);

        await _next(context);

        stopwatch.Stop();
        
        _logger.LogInformation("Finished handling request: {Method} {Path} in {ElapsedMilliseconds}ms. Status code: {StatusCode}",
            context.Request.Method, 
            context.Request.Path, 
            stopwatch.ElapsedMilliseconds, 
            context.Response.StatusCode);
    }
}

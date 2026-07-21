using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Application.Common.Models;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.ImportTodos;

public class ImportTodosCommandHandler : IRequestHandler<ImportTodosCommand, ApiResponse<int>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ICurrentUserService _currentUserService;

    public ImportTodosCommandHandler(ITodoRepository todoRepository, ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<int>> Handle(ImportTodosCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == Guid.Empty)
            return ApiResponse<int>.ErrorResponse("Unauthorized");

        if (string.IsNullOrWhiteSpace(request.CsvContent))
            return ApiResponse<int>.ErrorResponse("CSV content is empty");

        var lines = request.CsvContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        
        if (lines.Length <= 1)
            return ApiResponse<int>.ErrorResponse("No data found in CSV");

        int importedCount = 0;

        // Skip header line (index 0)
        for (int i = 1; i < lines.Length; i++)
        {
            var cols = lines[i].Split(',');
            if (cols.Length < 7) continue;

            // Simple parser assuming order: Id,Title,Description,IsCompleted,Priority,DueDate,CreatedAt
            var title = cols[1];
            var description = cols[2];
            bool.TryParse(cols[3], out bool isCompleted);
            int.TryParse(cols[4], out int priorityInt);
            DateTime.TryParse(cols[5], out DateTime dueDate);
            
            var priority = (Priority)(priorityInt > 0 ? priorityInt : 2); // Default to Medium
            
            var todo = new Todo(title, description, priority, dueDate == default ? null : dueDate, userId);
            if (isCompleted)
            {
                todo.IsCompleted = true;
            }

            await _todoRepository.AddAsync(todo, cancellationToken);
            importedCount++;
        }

        return ApiResponse<int>.SuccessResponse(importedCount, $"{importedCount} tasks imported successfully");
    }
}

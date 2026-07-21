using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.UpdateTodo;

/// <summary>
/// Handles the UpdateTodoCommand by fetching the existing entity, updating its fields, and saving to the DB.
/// </summary>
public class UpdateTodoCommandHandler : IRequestHandler<UpdateTodoCommand, Unit>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ITagRepository _tagRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateTodoCommandHandler(
        ITodoRepository todoRepository,
        ITagRepository tagRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _tagRepository = tagRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateTodoCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch the existing Todo ensuring it belongs to the current user
        var todo = await _todoRepository.GetByIdAndUserAsync(request.Id, _currentUserService.UserId, cancellationToken);

        if (todo == null)
        {
            throw new TodoNotFoundException(request.Id);
        }

        // 2. Update the properties
        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.Priority = request.Priority;
        todo.DueDate = request.DueDate;
        todo.Recurrence = request.Recurrence;

        if (request.TagIds != null)
        {
            var userTags = await _tagRepository.GetTagsByUserIdAsync(_currentUserService.UserId, cancellationToken);
            var validTagIds = userTags.Select(t => t.Id).Intersect(request.TagIds).ToList();
            
            // Remove tags that are no longer in the request
            var tagsToRemove = todo.Tags.Where(t => !validTagIds.Contains(t.Id)).ToList();
            foreach (var tag in tagsToRemove)
            {
                todo.Tags.Remove(tag);
            }
            
            // Add tags that are new in the request
            var existingTagIds = todo.Tags.Select(t => t.Id).ToList();
            var tagsToAdd = userTags.Where(t => validTagIds.Contains(t.Id) && !existingTagIds.Contains(t.Id)).ToList();
            foreach (var tag in tagsToAdd)
            {
                todo.Tags.Add(tag);
            }
        }

        // 3. Entity is already tracked, EF Core will detect changes including collection modifications

        // 4. Commit the transaction
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. MediatR requires returning Unit.Value when implementing IRequestHandler<T, Unit>
        return Unit.Value;
    }
}

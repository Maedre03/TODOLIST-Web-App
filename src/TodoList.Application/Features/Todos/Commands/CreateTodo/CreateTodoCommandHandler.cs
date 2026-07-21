using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.CreateTodo;

/// <summary>
/// Handles the CreateTodoCommand by creating a new Todo entity and saving it to the database.
/// </summary>
public class CreateTodoCommandHandler : IRequestHandler<CreateTodoCommand, Guid>
{
    private readonly ITodoRepository _todoRepository;
    private readonly ITagRepository _tagRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public CreateTodoCommandHandler(
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

    public async Task<Guid> Handle(CreateTodoCommand request, CancellationToken cancellationToken)
    {
        // 1. Create the entity using the domain constructor
        var todo = new Todo(
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            _currentUserService.UserId // Automatically assign to the logged-in user
        );

        todo.Recurrence = request.Recurrence;

        if (request.TagIds != null && request.TagIds.Any())
        {
            var userTags = await _tagRepository.GetTagsByUserIdAsync(_currentUserService.UserId, cancellationToken);
            var validTagIds = userTags.Select(t => t.Id).Intersect(request.TagIds).ToList();
            var tagsToAdd = userTags.Where(t => validTagIds.Contains(t.Id)).ToList();
            
            foreach (var tag in tagsToAdd)
            {
                todo.Tags.Add(tag);
            }
        }

        // 2. Add to the repository (this doesn't hit the DB yet)
        await _todoRepository.AddAsync(todo, cancellationToken);

        // 3. Commit the transaction
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Return the ID of the newly created Todo
        return todo.Id;
    }
}

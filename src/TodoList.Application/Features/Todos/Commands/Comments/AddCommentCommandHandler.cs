using AutoMapper;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.Comments;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, ApiResponse<CommentDto>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public AddCommentCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<CommentDto>> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.TodoId, cancellationToken);
        if (todo == null)
            throw new TodoNotFoundException(request.TodoId);

        // Optional: Check if user has access to the todo?
        if (todo.CreatedByUserId != _currentUserService.UserId)
            throw new UnauthorizedTodoAccessException(request.TodoId, _currentUserService.UserId);

        var comment = new Comment(request.Content, request.TodoId, _currentUserService.UserId);
        
        todo.Comments.Add(comment);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<CommentDto>(comment);
        // We manually inject the current user name since it wasn't loaded from DB
        dto.CreatedByUserName = "You"; 

        return ApiResponse<CommentDto>.SuccessResponse(dto, "Comment added successfully");
    }
}

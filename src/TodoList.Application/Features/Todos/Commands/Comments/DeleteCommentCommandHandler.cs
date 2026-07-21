using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.Comments;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, ApiResponse<bool>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteCommentCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.TodoId, cancellationToken);
        if (todo == null)
            throw new TodoNotFoundException(request.TodoId);

        if (todo.CreatedByUserId != _currentUserService.UserId)
            throw new UnauthorizedTodoAccessException(request.TodoId, _currentUserService.UserId);

        var comment = todo.Comments.FirstOrDefault(c => c.Id == request.CommentId);
        if (comment == null)
            return ApiResponse<bool>.ErrorResponse("Comment not found.");

        if (comment.CreatedByUserId != _currentUserService.UserId)
            return ApiResponse<bool>.ErrorResponse("You can only delete your own comments.");

        todo.Comments.Remove(comment);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Comment deleted successfully");
    }
}

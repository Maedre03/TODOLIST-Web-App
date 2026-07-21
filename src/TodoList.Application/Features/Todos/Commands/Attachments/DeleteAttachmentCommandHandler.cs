using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.Attachments;

public class DeleteAttachmentCommandHandler : IRequestHandler<DeleteAttachmentCommand, ApiResponse<bool>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public DeleteAttachmentCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<ApiResponse<bool>> Handle(DeleteAttachmentCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.TodoId, cancellationToken);
        if (todo == null)
            throw new TodoNotFoundException(request.TodoId);

        if (todo.CreatedByUserId != _currentUserService.UserId)
            throw new UnauthorizedTodoAccessException(request.TodoId, _currentUserService.UserId);

        var attachment = todo.Attachments.FirstOrDefault(a => a.Id == request.AttachmentId);
        if (attachment == null)
            return ApiResponse<bool>.ErrorResponse("Attachment not found.");

        await _fileStorageService.DeleteFileAsync(attachment.FilePath, cancellationToken);

        todo.Attachments.Remove(attachment);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Attachment deleted successfully");
    }
}

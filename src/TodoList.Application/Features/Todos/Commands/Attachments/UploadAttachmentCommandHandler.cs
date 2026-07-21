using AutoMapper;
using MediatR;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Models;
using TodoList.Domain.Exceptions;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Todos.Commands.Attachments;

public class UploadAttachmentCommandHandler : IRequestHandler<UploadAttachmentCommand, ApiResponse<AttachmentDto>>
{
    private readonly ITodoRepository _todoRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMapper _mapper;

    public UploadAttachmentCommandHandler(
        ITodoRepository todoRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService,
        IMapper mapper)
    {
        _todoRepository = todoRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
        _mapper = mapper;
    }

    public async Task<ApiResponse<AttachmentDto>> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.TodoId, cancellationToken);
        if (todo == null)
            throw new TodoNotFoundException(request.TodoId);

        if (todo.CreatedByUserId != _currentUserService.UserId)
            throw new UnauthorizedTodoAccessException(request.TodoId, _currentUserService.UserId);

        var filePath = await _fileStorageService.SaveFileAsync(request.FileStream, request.FileName, cancellationToken);

        var attachment = new Attachment(request.FileName, request.ContentType, request.FileSize, filePath, request.TodoId);
        
        todo.Attachments.Add(attachment);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<AttachmentDto>(attachment);

        return ApiResponse<AttachmentDto>.SuccessResponse(dto, "File uploaded successfully");
    }
}

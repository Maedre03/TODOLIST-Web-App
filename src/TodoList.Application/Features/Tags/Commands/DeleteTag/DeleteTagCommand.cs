using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Tags.Commands.DeleteTag;

public record DeleteTagCommand(Guid Id) : IRequest;

public class DeleteTagCommandHandler : IRequestHandler<DeleteTagCommand>
{
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTagCommandHandler(ITagRepository tagRepository, ICurrentUserService currentUserService, IUnitOfWork unitOfWork)
    {
        _tagRepository = tagRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteTagCommand request, CancellationToken cancellationToken)
    {
        var tag = await _tagRepository.GetByIdAsync(request.Id, cancellationToken);

        if (tag == null)
        {
            throw new TagNotFoundException(request.Id);
        }

        if (tag.CreatedByUserId != _currentUserService.UserId)
        {
            throw new UnauthorizedTagAccessException();
        }

        _tagRepository.Delete(tag);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

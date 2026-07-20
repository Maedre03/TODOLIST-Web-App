using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Tags.Commands.CreateTag;

public record CreateTagCommand(string Name, string Color) : IRequest<Guid>;

public class CreateTagCommandHandler : IRequestHandler<CreateTagCommand, Guid>
{
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentUserService _currentUserService;

    public CreateTagCommandHandler(ITagRepository tagRepository, ICurrentUserService currentUserService)
    {
        _tagRepository = tagRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateTagCommand request, CancellationToken cancellationToken)
    {
        var tag = new Tag(request.Name, request.Color, _currentUserService.UserId);

        await _tagRepository.AddAsync(tag, cancellationToken);

        return tag.Id;
    }
}

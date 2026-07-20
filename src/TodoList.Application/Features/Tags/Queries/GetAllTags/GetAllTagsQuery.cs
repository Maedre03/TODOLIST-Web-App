using AutoMapper;
using MediatR;
using System.Collections.Generic;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Tags.Queries.GetAllTags;

public record GetAllTagsQuery : IRequest<IReadOnlyList<TagDto>>;

public class GetAllTagsQueryHandler : IRequestHandler<GetAllTagsQuery, IReadOnlyList<TagDto>>
{
    private readonly ITagRepository _tagRepository;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetAllTagsQueryHandler(ITagRepository tagRepository, IMapper mapper, ICurrentUserService currentUserService)
    {
        _tagRepository = tagRepository;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<TagDto>> Handle(GetAllTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _tagRepository.GetTagsByUserIdAsync(_currentUserService.UserId, cancellationToken);
        return _mapper.Map<IReadOnlyList<TagDto>>(tags);
    }
}

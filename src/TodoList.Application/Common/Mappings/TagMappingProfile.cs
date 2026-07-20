using AutoMapper;
using TodoList.Application.Common.DTOs;
using TodoList.Domain.Entities;

namespace TodoList.Application.Common.Mappings;

public class TagMappingProfile : Profile
{
    public TagMappingProfile()
    {
        CreateMap<Tag, TagDto>();
    }
}

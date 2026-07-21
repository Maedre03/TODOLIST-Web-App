using AutoMapper;
using TodoList.Application.Common.DTOs;
using TodoList.Domain.Entities;

namespace TodoList.Application.Common.Mappings;

public class TodoMappingProfile : Profile
{
    public TodoMappingProfile()
    {
        CreateMap<Todo, TodoDto>();
        CreateMap<SubTask, SubTaskDto>();
        CreateMap<Comment, CommentDto>()
            .ForMember(d => d.CreatedByUserName, opt => opt.MapFrom(s => s.CreatedByUser.Username));
        CreateMap<Attachment, AttachmentDto>();
    }
}

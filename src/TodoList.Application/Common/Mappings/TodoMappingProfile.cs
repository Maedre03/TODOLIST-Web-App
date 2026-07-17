using AutoMapper;
using TodoList.Application.Common.DTOs;
using TodoList.Domain.Entities;

namespace TodoList.Application.Common.Mappings;

public class TodoMappingProfile : Profile
{
    public TodoMappingProfile()
    {
        CreateMap<Todo, TodoDto>();
    }
}

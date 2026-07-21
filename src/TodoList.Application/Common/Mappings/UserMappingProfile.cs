using AutoMapper;
using TodoList.Domain.Entities;

namespace TodoList.Application.Common.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, TodoList.Application.Common.DTOs.UserProfileDto>();
    }
}

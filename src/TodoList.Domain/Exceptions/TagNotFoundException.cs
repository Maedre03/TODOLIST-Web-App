using System;

namespace TodoList.Domain.Exceptions;

public class TagNotFoundException : DomainException
{
    public TagNotFoundException(Guid tagId) 
        : base($"Tag with ID '{tagId}' was not found.")
    {
    }
}

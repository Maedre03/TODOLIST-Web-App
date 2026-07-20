using System;

namespace TodoList.Domain.Exceptions;

public class UnauthorizedTagAccessException : DomainException
{
    public UnauthorizedTagAccessException() 
        : base("You are not authorized to access or modify this tag.")
    {
    }
}

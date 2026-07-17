using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TodoList.Application.Common.Interfaces;
using TodoList.Domain.Entities;
using TodoList.Domain.Exceptions;
using TodoList.Domain.Repositories;

namespace TodoList.Application.Features.Auth.Commands.RegisterUser;

/// <summary>
/// Handles the RegisterUserCommand by validating the email, hashing the password, and saving the user.
/// </summary>
public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Check if the email is already registered
        if (!await _userRepository.IsEmailUniqueAsync(request.Email, cancellationToken))
        {
            throw new EmailAlreadyInUseException(request.Email);
        }

        // 2. Hash the password securely (never store plain text!)
        var passwordHash = _passwordHasher.HashPassword(request.Password);

        // 3. Create the domain entity
        var user = new User(request.Username, request.Email, passwordHash);

        // 4. Save to the database
        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Return the new User ID
        return user.Id;
    }
}

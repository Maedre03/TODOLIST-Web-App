using System;

namespace TodoList.Application.Common.Interfaces;

/// <summary>
/// Provides access to the current authenticated user's information.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the unique identifier of the currently authenticated user.
    /// </summary>
    Guid UserId { get; }
}

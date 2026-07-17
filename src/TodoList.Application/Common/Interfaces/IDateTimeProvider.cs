using System;

namespace TodoList.Application.Common.Interfaces;

/// <summary>
/// Provides access to the current date and time.
/// </summary>
public interface IDateTimeProvider
{
    /// <summary>
    /// Gets the current UTC date and time.
    /// </summary>
    DateTime UtcNow { get; }
}

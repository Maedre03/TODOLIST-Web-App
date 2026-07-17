namespace TodoList.Domain.Common;

/// <summary>
/// Interface for all domain events in the system.
/// Domain events represent something that happened in the past that the domain experts care about.
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// Gets the timestamp when the event occurred.
    /// </summary>
    DateTime OccurredOn { get; }
}

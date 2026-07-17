using MediatR;
using TodoList.Domain.Common;

namespace TodoList.Application.Common.Models;

/// <summary>
/// A generic wrapper to adapt a Domain Event into a MediatR INotification.
/// This allows the Domain layer to remain ignorant of MediatR while still
/// allowing Application layer handlers to subscribe to Domain Events.
/// </summary>
public class DomainEventNotification<TDomainEvent> : INotification where TDomainEvent : IDomainEvent
{
    public DomainEventNotification(TDomainEvent domainEvent)
    {
        DomainEvent = domainEvent;
    }

    public TDomainEvent DomainEvent { get; }
}

using TodoList.Application.Common.Interfaces;

namespace TodoList.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TodoList.Infrastructure.Persistence;

namespace TodoList.Infrastructure.Services;

public class DailyDigestBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyDigestBackgroundService> _logger;

    public DailyDigestBackgroundService(IServiceProvider serviceProvider, ILogger<DailyDigestBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyDigestBackgroundService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDailyDigestAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing DailyDigestBackgroundService.");
            }

            // In a real scenario, this might calculate time until next 8 AM, but for this demo, 
            // we'll run it every 24 hours (or realistically, we can run every hour to check).
            // Let's set it to run once every 24 hours.
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task ProcessDailyDigestAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Processing Daily Digest emails...");

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var dueTodos = await dbContext.Todos
            .Include(t => t.CreatedByUser)
            .Where(t => !t.IsDeleted && !t.IsCompleted && t.DueDate != null && t.DueDate < tomorrow)
            .ToListAsync(stoppingToken);

        if (!dueTodos.Any())
        {
            _logger.LogInformation("No due or overdue tasks found. Skipping email digest.");
            return;
        }

        var groupedTodos = dueTodos.GroupBy(t => t.CreatedByUserId).ToList();

        foreach (var group in groupedTodos)
        {
            var user = group.First().CreatedByUser;
            var emailAddress = user.Email;

            _logger.LogInformation($"[MOCK EMAIL SEND] To: {emailAddress} | Subject: Your Daily Task Digest");
            _logger.LogInformation("Body: Hello, you have the following tasks due today or overdue:");
            foreach (var todo in group)
            {
                var status = todo.DueDate < today ? "[OVERDUE]" : "[DUE TODAY]";
                _logger.LogInformation($" - {status} {todo.Title} (Priority: {todo.Priority})");
            }
        }
        
        _logger.LogInformation("Daily Digest processing completed.");
    }
}

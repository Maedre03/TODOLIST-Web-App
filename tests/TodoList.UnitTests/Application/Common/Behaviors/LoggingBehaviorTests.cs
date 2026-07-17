using MediatR;
using Microsoft.Extensions.Logging;
using NSubstitute;
using TodoList.Application.Common.Behaviors;
using Xunit;

namespace TodoList.UnitTests.Application.Common.Behaviors;

public class LoggingBehaviorTests
{
    public class TestRequest : IRequest<string>
    {
        public string Name { get; set; } = "Test";
    }

    [Fact]
    public async Task Handle_ShouldLogInformationAndCallNext()
    {
        // Arrange
        var logger = Substitute.For<ILogger<LoggingBehavior<TestRequest, string>>>();
        var behavior = new LoggingBehavior<TestRequest, string>(logger);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next().Returns(Task.FromResult("Success"));

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Success", result);
        await next.Received(1)();
        
        // Assert log was called
        logger.ReceivedWithAnyArgs(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }
}

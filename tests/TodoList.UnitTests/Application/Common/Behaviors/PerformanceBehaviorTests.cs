using MediatR;
using Microsoft.Extensions.Logging;
using NSubstitute;
using TodoList.Application.Common.Behaviors;
using TodoList.Application.Common.Interfaces;
using Xunit;

namespace TodoList.UnitTests.Application.Common.Behaviors;

public class PerformanceBehaviorTests
{
    public class TestRequest : IRequest<string>
    {
        public string Name { get; set; } = "Test";
    }

    [Fact]
    public async Task Handle_WhenTakesLessThan500Ms_ShouldNotLogWarning()
    {
        // Arrange
        var logger = Substitute.For<ILogger<TestRequest>>();
        var currentUserService = Substitute.For<ICurrentUserService>();
        currentUserService.UserId.Returns(Guid.NewGuid());

        var behavior = new PerformanceBehavior<TestRequest, string>(logger, currentUserService);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next().Returns(Task.FromResult("Success"));

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Success", result);
        await next.Received(1)();
        
        // Assert log was not called
        logger.DidNotReceiveWithAnyArgs().Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task Handle_WhenTakesMoreThan500Ms_ShouldLogWarning()
    {
        // Arrange
        var logger = Substitute.For<ILogger<TestRequest>>();
        var currentUserService = Substitute.For<ICurrentUserService>();
        currentUserService.UserId.Returns(Guid.NewGuid());

        var behavior = new PerformanceBehavior<TestRequest, string>(logger, currentUserService);
        var request = new TestRequest();
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next().Returns(async callInfo => {
            await Task.Delay(550);
            return "Success";
        });

        // Act
        var result = await behavior.Handle(request, next, CancellationToken.None);

        // Assert
        Assert.Equal("Success", result);
        await next.Received(1)();
        
        // Assert log was called
        logger.ReceivedWithAnyArgs(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<object, Exception?, string>>());
    }
}

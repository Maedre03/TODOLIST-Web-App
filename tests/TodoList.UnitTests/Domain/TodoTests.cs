using FluentAssertions;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;
using TodoList.Domain.Events;

namespace TodoList.UnitTests.Domain;

public class TodoTests
{
    [Fact]
    public void Constructor_ShouldInitializeTodo_WithGivenValuesAndDefaultState()
    {
        // Arrange
        var title = "Test Todo";
        var description = "Test Description";
        var priority = Priority.High;
        var dueDate = DateTime.UtcNow.AddDays(1);
        var userId = Guid.NewGuid();

        // Act
        var todo = new Todo(title, description, priority, dueDate, userId);

        // Assert
        todo.Id.Should().NotBeEmpty();
        todo.Title.Should().Be(title);
        todo.Description.Should().Be(description);
        todo.Priority.Should().Be(priority);
        todo.DueDate.Should().Be(dueDate);
        todo.CreatedByUserId.Should().Be(userId);
        
        todo.IsCompleted.Should().BeFalse();
        todo.IsDeleted.Should().BeFalse();
        todo.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_ShouldRaiseTodoCreatedEvent()
    {
        // Arrange & Act
        var todo = new Todo("Title", "Description", Priority.Low, null, Guid.NewGuid());

        // Assert
        todo.DomainEvents.Should().ContainSingle();
        var domainEvent = todo.DomainEvents.First();
        domainEvent.Should().BeOfType<TodoCreatedEvent>();
        
        var createdEvent = (TodoCreatedEvent)domainEvent;
        createdEvent.Todo.Should().Be(todo);
    }
}

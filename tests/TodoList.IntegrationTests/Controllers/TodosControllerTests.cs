using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using TodoList.Application.Common.DTOs;
using TodoList.Application.Features.Todos.Commands.CreateTodo;
using TodoList.Domain.Enums;
using TodoList.IntegrationTests.Common;

namespace TodoList.IntegrationTests.Controllers;

public class TodosControllerTests : IntegrationTestBase
{
    public TodosControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Post_CreateTodo_ReturnsCreated()
    {
        // Arrange
        var token = await RegisterAndLoginAsync("testuser1", "test1@example.com", "password123");
        AuthenticateClient(token);

        var command = new CreateTodoCommand("Integration Test Todo", "Description", Priority.High, null);

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/todos", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        // Ensure it returns the ID
        var result = await response.Content.ReadFromJsonAsync<CreateTodoResponse>();
        result.Should().NotBeNull();
        result!.Id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Get_Todos_ReturnsOnlyCurrentUserTodos()
    {
        // Arrange - User 1 creates a todo
        var token1 = await RegisterAndLoginAsync("user1", "user1@example.com", "password123");
        AuthenticateClient(token1);
        var command = new CreateTodoCommand("User1 Todo", "Desc", Priority.High, null);
        await _client.PostAsJsonAsync("/api/v1/todos", command);

        // Act - User 2 logs in and gets their todos
        var token2 = await RegisterAndLoginAsync("user2", "user2@example.com", "password123");
        AuthenticateClient(token2);
        
        var response = await _client.GetAsync("/api/v1/todos?pageNumber=1&pageSize=10");
        
        // Assert
        response.EnsureSuccessStatusCode();
        // Since we are using PaginatedList<TodoDto>, we read the content
        var resultStr = await response.Content.ReadAsStringAsync();
        
        // Check that "User1 Todo" is not in the response
        resultStr.Should().NotContain("User1 Todo");
    }

    [Fact]
    public async Task Delete_Todo_ByNonOwner_ReturnsForbidden()
    {
        // Arrange - User 1 creates a todo
        var token1 = await RegisterAndLoginAsync("user3", "user3@example.com", "password123");
        AuthenticateClient(token1);
        var command = new CreateTodoCommand("User3 Todo", "Desc", Priority.High, null);
        var createResponse = await _client.PostAsJsonAsync("/api/v1/todos", command);
        var createdDto = await createResponse.Content.ReadFromJsonAsync<CreateTodoResponse>();
        var todoId = createdDto!.Id;

        // Act - User 2 tries to delete User 1's todo
        var token2 = await RegisterAndLoginAsync("user4", "user4@example.com", "password123");
        AuthenticateClient(token2);
        
        var deleteResponse = await _client.DeleteAsync($"/api/v1/todos/{todoId}");
        
        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}

public class CreateTodoResponse
{
    public Guid Id { get; set; }
}

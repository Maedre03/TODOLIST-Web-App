using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using TodoList.Application.Features.Auth.Commands.LoginUser;
using TodoList.Application.Features.Auth.Commands.RegisterUser;
using TodoList.Infrastructure.Persistence;

namespace TodoList.IntegrationTests.Common;

public class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient _client;
    protected readonly CustomWebApplicationFactory _factory;

    public IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    protected async Task<string> RegisterAndLoginAsync(string username, string email, string password)
    {
        // Register
        var registerCommand = new RegisterUserCommand(username, email, password);
        var registerResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerCommand);
        registerResponse.EnsureSuccessStatusCode();

        // Login
        var loginCommand = new LoginUserCommand(email, password);
        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", loginCommand);
        loginResponse.EnsureSuccessStatusCode();

        var result = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.Token;
    }

    protected void AuthenticateClient(string token)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
}

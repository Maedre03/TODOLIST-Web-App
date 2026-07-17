using Microsoft.EntityFrameworkCore;
using TodoList.Domain.Entities;
using TodoList.Domain.Enums;

namespace TodoList.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Try to apply any pending migrations
        if (context.Database.IsSqlServer())
        {
            await context.Database.MigrateAsync();
        }

        // Seed Users
        if (!await context.Users.AnyAsync())
        {
            // Note: In a real scenario, use IPasswordHasher. For this seeder, we use a dummy hash 
            // until we wire up BCrypt properly, or we can use BCrypt here if we add the package.
            // For now, let's just create a basic user.
            var demoUser = new User("demouser", "demo@todolist.com", "$2a$11$w8h.u2lQ0Wv3tV.V4L1SGu9Q1N9wT7Z1o1Y1z1x1v1u1t1s1r1q1p"); // valid dummy BCrypt format
            
            await context.Users.AddAsync(demoUser);

            var todo1 = new Todo("Welcome to Todo List", "This is your first todo.", Priority.Medium, DateTime.UtcNow.AddDays(1), demoUser.Id);
            var todo2 = new Todo("Learn Clean Architecture", "Understand the layers and MediatR.", Priority.High, DateTime.UtcNow.AddDays(7), demoUser.Id);

            await context.Todos.AddRangeAsync(todo1, todo2);

            await context.SaveChangesAsync();
        }
    }
}

using Microsoft.AspNetCore.Hosting;
using TodoList.Application.Common.Interfaces;

namespace TodoList.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;

    public LocalFileStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        // Return the relative URL path to access the file
        return $"/uploads/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        // filePath will be like /uploads/guid_filename.ext
        var absolutePath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), filePath.TrimStart('/'));

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }

        return Task.CompletedTask;
    }
}

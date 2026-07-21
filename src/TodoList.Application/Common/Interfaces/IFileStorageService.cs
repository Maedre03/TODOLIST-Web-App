namespace TodoList.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Saves a file to storage and returns the stored file path or URL.
    /// </summary>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from storage given its path or URL.
    /// </summary>
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
}

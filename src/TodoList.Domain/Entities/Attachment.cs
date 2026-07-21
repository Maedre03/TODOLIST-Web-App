using TodoList.Domain.Common;

namespace TodoList.Domain.Entities;

/// <summary>
/// Domain model representing a file attachment on a Todo item.
/// </summary>
public class Attachment : Entity<Guid>
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public Guid TodoId { get; set; }

    // Navigation property
    public virtual Todo Todo { get; set; } = null!;

    protected Attachment() { }

    public Attachment(string fileName, string contentType, long fileSize, string filePath, Guid todoId)
    {
        Id = Guid.NewGuid();
        FileName = fileName;
        ContentType = contentType;
        FileSize = fileSize;
        FilePath = filePath;
        TodoId = todoId;
        IsDeleted = false;
        CreatedAt = DateTime.UtcNow;
    }
}

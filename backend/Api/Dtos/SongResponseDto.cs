namespace Api.Dtos
{
    public class SongResponseDto
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public UserResponseDto? User { get; set; } // Simplified User
        public required string Title { get; set; }
        public string? S3Key { get; set; }
        public string? ThumbnailS3Key { get; set; }
        public required string Status { get; set; }
        public bool Instrumental { get; set; }
        public string? Prompt { get; set; }
        public double? AudioDuration { get; set; }
        public bool Published { get; set; }
        public int ListenCount { get; set; }
        public int Likes { get; set; } // Usually just IDs or a count is enough
        public string? SongUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public List<string> Categories { get; set; } // Flattened to names/IDs
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
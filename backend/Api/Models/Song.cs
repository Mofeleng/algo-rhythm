namespace Api.Models
{
    public class Song
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public required string Title { get; set; }
        public string? S3Key { get; set; }
        public string? ThumbnailS3Key { get; set; }
        public string Status { get; set; } = "Queued";
        public bool Instrumental { get; set; } = false;
        public string? Prompt { get; set; }
        public string? Lyrics { get; set; }
        public string? SongDescription { get; set; }
        public string? LyricsDescription { get; set; }
        public float? GuidanceScale { get; set; }
        public int? InferStep { get; set; }
        public float? AudioDuration { get; set; }
        public int? Seed { get; set; }
        public bool Published { get; set; } = false;
        public int ListenCount { get; set; }
        public ICollection<SongLike> Likes { get; set; } = new List<SongLike>();
        public ICollection<SongCategory> SongCategories { get; set; } = new List<SongCategory>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

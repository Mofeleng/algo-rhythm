using System.Text.Json.Serialization;

namespace Api.Models
{
    public class Song
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("userId")]
        public Guid UserId { get; set; }

        [JsonPropertyName("user")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public User? User { get; set; }

        [JsonPropertyName("title")]
        public required string Title { get; set; }

        [JsonPropertyName("r2Key")]
        public string? S3Key { get; set; }

        [JsonPropertyName("thumbnailR2Key")]
        public string? ThumbnailS3Key { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "Queued";

        [JsonPropertyName("instrumental")]
        public bool Instrumental { get; set; } = false;

        [JsonPropertyName("prompt")]
        public string? Prompt { get; set; }

        [JsonPropertyName("lyrics")]
        public string? Lyrics { get; set; }

        [JsonPropertyName("songDescription")]
        public string? SongDescription { get; set; }

        [JsonPropertyName("lyricsDescription")]
        public string? LyricsDescription { get; set; }

        [JsonPropertyName("guidanceScale")]
        public float? GuidanceScale { get; set; }

        [JsonPropertyName("inferStep")]
        public int? InferStep { get; set; }

        [JsonPropertyName("audioDuration")]
        public float? AudioDuration { get; set; }

        [JsonPropertyName("seed")]
        public int? Seed { get; set; }

        [JsonPropertyName("published")]
        public bool Published { get; set; } = false;

        [JsonPropertyName("listenCount")]
        public int ListenCount { get; set; }

        [JsonPropertyName("likes")]
        public ICollection<SongLike> Likes { get; set; } = new List<SongLike>();

        [JsonPropertyName("songCategories")]
        public ICollection<SongCategory> SongCategories { get; set; } = new List<SongCategory>();

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("songUrl")]
        public string? SongUrl { get; set; }
        
        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }
    }
}

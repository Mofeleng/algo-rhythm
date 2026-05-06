namespace Api.Dtos
{
    public class GenerateSongClientRequest
    {
        public required string Title { get; set; }
        public string? Prompt { get; set; }
        public string? Lyrics { get; set; }
        public string? SongDescription { get; set; }
        public string? LyricsDescription { get; set; }
        public bool? Instrumental { get; set; }
        public float? GuidanceScale { get; set; }
        public float? AudioDuration { get; set; }
        public int? Seed { get; set; }
        public int? InferStep { get; set; }
        public required string UserId { get; set; }

    }
}

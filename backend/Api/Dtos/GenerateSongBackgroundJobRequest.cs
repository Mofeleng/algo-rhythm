namespace Api.Dtos
{
    public class GenerateSongBackgroundJobRequest
    {
        public float? guidance_scale { get; set; }
        public int? infer_step { get; set; }
        public float? audio_duration { get; set; }
        public int? seed { get; set; }
        public string? prompt { get; set; }
        public string? lyrics { get; set; }
        public string? described_lyrics { get; set; }
        public string? song_description { get; set; }
        public bool instrumental { get; set; }

    }
}

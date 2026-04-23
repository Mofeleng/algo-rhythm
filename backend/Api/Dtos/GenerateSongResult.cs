using System.Text.Json.Serialization;

namespace Api.Dtos
{
    public class GenerateSongResult
    {
        [JsonPropertyName("r2_key")]
        public string r2_key { get; set; } = string.Empty;

        // Map the Python "cover_image_r2_key" to your C# property
        [JsonPropertyName("cover_image_r2_key")]
        public string cover_image_r2 { get; set; } = string.Empty;

        [JsonPropertyName("categories")]
        public List<string>? categories { get; set; }

    }
}

using System.Text.Json.Serialization;

namespace Api.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        [JsonIgnore]
        public string Password { get; set; } = string.Empty;
        public int Credits { get; set; }
        public ICollection<Song> Songs { get; set; } = new List<Song>();
        public ICollection<SongLike> LikedSongs { get; set; } = new List<SongLike>();
    }
}

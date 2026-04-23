namespace Api.Models
{
    public class SongLike
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public Guid SongId { get; set; }
        public Song? Song { get; set; }
    }
}

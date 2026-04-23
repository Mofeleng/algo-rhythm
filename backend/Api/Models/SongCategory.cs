namespace Api.Models
{
    public class SongCategory
    {
        public Guid SongId { get; set; }
        public Song? Song { get; set; }
        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}

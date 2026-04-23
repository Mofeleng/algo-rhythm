namespace Api.Models
{
    public class Category
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public ICollection<SongCategory> SongCategories { get; set; } = new List<SongCategory>();
    }
}

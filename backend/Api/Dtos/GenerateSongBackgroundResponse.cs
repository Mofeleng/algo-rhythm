namespace Api.Dtos
{
    public class GenerateSongBackgroundResponse
    {
        public Guid UserId { get; set; }
        public Guid SongId { get; set; }
        public int Credits { get; set; }
        public required string Endpoint { get; set; }
        public required GenerateSongBackgroundJobRequest Body { get; set; }

    }
}

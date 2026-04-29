namespace Api.Dtos
{
    public class RenameSongRequestDto:SongIdRequestDto
    {
        public required string newName { get; set; }
    }
}

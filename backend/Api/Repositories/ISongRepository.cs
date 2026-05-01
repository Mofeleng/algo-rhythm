
using Api.Models;
using Api.Dtos;

namespace Api.Repositories
{
    public interface ISongRepository
    {
        Song? GetById(Guid songId);
        Task<List<SongResponseDto>> GetMostRecentPublished();
        Song Create(Song song);
        Song Delete(Song song);
        Task<List<Song>?> GetByUserId(Guid userId);
        void SaveChanges();
    }
}

using Api.Models;

namespace Api.Repositories
{
    public interface ISongRepository
    {
        Song? GetById(Guid songId);
        Song Create(Song song);
        Task<List<Song>?> GetByUserId(Guid userId);
        void SaveChanges();
    }
}

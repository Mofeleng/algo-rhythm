using Api.Models;

namespace Api.Repositories
{
    public interface ISongRepository
    {
        Song? GetById(Guid songId);
        Song Create(Song song);
        void SaveChanges();
    }
}

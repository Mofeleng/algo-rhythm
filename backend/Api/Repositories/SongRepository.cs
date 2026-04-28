using Api.Controllers;
using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories
{
    public class SongRepository : ISongRepository
    {
        private readonly AppDbContext _context;
        public SongRepository(AppDbContext context)
        {
            _context = context;
        }
        public Song Create(Song song)
        {
            song.Id = new Guid();
            _context.Songs.Add(song);
            _context.SaveChanges();

            return song;
        }

        public Song? GetById(Guid songId)
        {
            return _context.Songs.FirstOrDefault(s => s.Id == songId);
        }

        public async Task<List<Song>?> GetByUserId(Guid userId)
        {
            var songs = await _context.Songs.Where(s => s.UserId == userId).OrderByDescending(s => s.CreatedAt).ToListAsync();

            return songs;
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }
    }
}

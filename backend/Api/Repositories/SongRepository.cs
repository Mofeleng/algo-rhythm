using Api.Controllers;
using Api.Data;
using Api.Dtos;
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

        public Song Delete(Song song)
        {
            _context.Remove(song);
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

        public async Task<List<SongResponseDto>> GetMostRecentPublished()
        {
            var songs = await _context.Songs
                .Where(s => s.Published)
                .OrderByDescending(s => s.CreatedAt)
                .Take(100)
                .Select(s => new SongResponseDto
                {
                    Id = s.Id.ToString(),
                    UserId = s.UserId.ToString(),
                    Title = s.Title,
                    S3Key = s.S3Key,
                    ThumbnailS3Key = s.ThumbnailS3Key,
                    Status = s.Status,
                    Instrumental = s.Instrumental,
                    Prompt = s.Prompt,
                    AudioDuration = s.AudioDuration,
                    Published = s.Published,
                    ListenCount = s.ListenCount,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    User = s.User == null ? null : new UserResponseDto
                    {
                        Id = s.User.Id.ToString(),
                        Name = s.User.Name,
                        Email = s.User.Email
                    },
                    Categories = s.SongCategories.Where(s => s.Category != null).Select(c => c.Category!.Name).ToList() ?? new List<string>(),
                    Likes = s.Likes.Select(l => l.UserId).Count()
                })
                .ToListAsync();

            return songs;
        }

        public void SaveChanges()
        {
            _context.SaveChanges();
        }
    }
}

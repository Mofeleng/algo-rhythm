using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options):base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Song> Songs { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SongCategory> SongCategories { get; set; }
        public DbSet<SongLike> SongLikes { get; set; }

        public override int SaveChanges()
        {
            TouchTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            TouchTimestamps();
            return base.SaveChangesAsync(ct);
        }

        private void TouchTimestamps()
        {
            foreach (var entry in ChangeTracker.Entries<Song>()
                .Where(e => e.State == EntityState.Modified))
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity => { entity.HasIndex(e => e.Email).IsUnique(); });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(u => u.Credits).HasDefaultValue(100);
            });

            // Song likes
            modelBuilder.Entity<SongLike>(entity =>
            {
                entity.HasKey(sl => new { sl.UserId, sl.SongId }); // Set userId and songId as keys

                // Song like has one user, with many liked songs, a foreign key to this user is userId, and when we delete the user delete all likes related to this userId
                entity.HasOne(sl => sl.User).WithMany(u => u.LikedSongs).HasForeignKey(sl => sl.UserId).OnDelete(DeleteBehavior.Cascade);
                
                // Song like has one song, with many likes, a foreign key to this song is songId, and when we delete the song delete all likes related to this songId
                entity.HasOne(sl => sl.Song).WithMany(s => s.Likes).HasForeignKey(sl => sl.SongId).OnDelete(DeleteBehavior.Cascade);
            });

            // Song
            modelBuilder.Entity<Song>(entity =>
            {
                entity.HasOne(s => s.User).WithMany(u => u.Songs).HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);

                //Set timestamps
                entity.Property(s => s.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(s => s.UpdatedAt).HasDefaultValueSql("NOW()");
            });

            //Song category
            modelBuilder.Entity<SongCategory>(entity =>
            {
                entity.HasKey(sc => new { sc.SongId, sc.CategoryId });

                entity.HasOne(sc => sc.Song).WithMany(s => s.SongCategories).HasForeignKey(sc => sc.SongId);
                entity.HasOne(sc => sc.Category).WithMany(c => c.SongCategories).HasForeignKey(sc => sc.CategoryId);
            });
        }
    }
}

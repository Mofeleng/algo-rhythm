using Amazon.S3;
using Api.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Api.Services;
using Api.Dtos;

namespace Api.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class SongsController:ControllerBase
    {
        private readonly ISongRepository _songRepository;
        private readonly IConfiguration _configuration;
        private readonly SongService _songService;

        private string _accessId;
        private string _secretKey;
        private string _bucketName;

        private AmazonS3Config _s3Config;
        private IAmazonS3 _r2Client;

        public SongsController(
            ISongRepository songRepository,
            IConfiguration configuration,
            SongService songService
        )
        {
            _songRepository = songRepository;
            _configuration = configuration;
            _songService = songService;

            _accessId = _configuration.GetValue<string>("Cloudflare:AccessKeyId")!;
            _secretKey = _configuration.GetValue<string>("Cloudflare:SecretAccessKey")!;
            _bucketName = _configuration.GetValue<string>("Cloudflare:BucketName")!;
            _s3Config = new AmazonS3Config
            {
                ServiceURL = _configuration.GetValue<string>("Cloudflare:R2Api")
            };

            _r2Client = new AmazonS3Client(_accessId, _secretKey, _s3Config);
        }

        [HttpGet]
        [Route("get-all")]
        [Authorize]
        public async Task<IActionResult> GetTopHundred()
        {
            var songs = await _songRepository.GetMostRecentPublished();
            if (songs == null || !songs.Any()) return NotFound(new { message = "No published songs" });

            Parallel.ForEach(songs, song =>
            {
                var thumbnailUrl = song.ThumbnailS3Key != null ?
                   _songService.GeneratePresignedUrl(_r2Client, _bucketName, song.ThumbnailS3Key) :
                   null;

                song.ThumbnailUrl = thumbnailUrl;
            });

            return Ok(new { songs });
        }

        [HttpGet]
        [Route("get-many")]
        [Authorize]
        public async Task<IActionResult> GetMany()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Please log in to access this resource" });

            var userId = Guid.Parse(userIdClaim);

            var songs = await _songRepository.GetByUserId(userId);
            if (songs == null || !songs.Any()) return Ok(songs);

            Parallel.ForEach(songs, song =>
            {
                var thumbnailUrl = song.ThumbnailS3Key != null ?
                    _songService.GeneratePresignedUrl(_r2Client, _bucketName, song.ThumbnailS3Key) :
                    null;

                song.ThumbnailUrl = thumbnailUrl;
            });

            return Ok(songs);
        }

        [HttpPost]
        [Route("generate-play-url")]
        [Authorize]
        public IActionResult GeneratePlayUrl([FromBody] SongIdRequestDto request)
        {
            var song = _songRepository.GetById(Guid.Parse(request.songId));
            if (song is null) return NotFound(new { message = "Cannot generate a play url for a non existant song" });

            if (string.IsNullOrEmpty(song.S3Key))
            {
                return BadRequest(new { message = "Cannot generate play url for non existant song" });
            }
            string accessId = _configuration.GetValue<string>("Cloudflare:AccessKeyId")!;
            string secretKey = _configuration.GetValue<string>("Cloudflare:SecretAccessKey")!;
            string bucketName = _configuration.GetValue<string>("Cloudflare:BucketName")!;

            var config = new AmazonS3Config
            {
                ServiceURL = _configuration.GetValue<string>("Cloudflare:R2Api")
            };

            IAmazonS3 r2Client = new AmazonS3Client(accessId, secretKey, config);

            string presignedUrl = _songService.GeneratePresignedUrl(_r2Client, bucketName, song.S3Key);
            Console.WriteLine("Presigned: " + presignedUrl);

            //Consider song listened to if a presigned url is generated
            song.ListenCount++;
            _songRepository.SaveChanges();

            return Ok(new { songUrl = presignedUrl });

        }

        [HttpPost]
        [Route("set-published-status")]
        [Authorize]
        public IActionResult SetPublishedStatus([FromBody] SongIdRequestDto request)
        {
            var song = _songRepository.GetById(Guid.Parse(request.songId));
            if (song is null) return NotFound(new { message = "Song does not exist" });

            song.Published = !song.Published;
            _songRepository.SaveChanges();

            return Ok(new { message = "Published" });
        }

        [HttpPatch]
        [Route("rename")]
        [Authorize]
        public IActionResult RenameSong([FromBody] RenameSongRequestDto request)
        {
            var song = _songRepository.GetById(Guid.Parse(request.songId));
            if (song is null) return NotFound(new { message = "Song does not exist" });

            song.Title = request.newName;
            _songRepository.SaveChanges();

            return Ok(new { song });
        }

        [HttpDelete]
        [Route("delete")]
        [Authorize]
        public IActionResult DeleteSong([FromBody] SongIdRequestDto request)
        {
            var song = _songRepository.GetById(Guid.Parse(request.songId));
            if (song is null) return NotFound(new { message = "Song does not exist" });

            _songRepository.Delete(song);

            return Ok(new { song });
        }
    }
}

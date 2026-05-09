using Api.Dtos;
using Api.Models;
using Api.Repositories;
using Api.Services;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class JobsController: ControllerBase
    {
        private readonly SongService _songService;
        private readonly ISongRepository _songRepository;
        private readonly IUserRepository _userRepository;

        public JobsController(SongService songService, ISongRepository songRepository, IUserRepository userRepository)
        {
            _songService = songService;
            _songRepository = songRepository;
            _userRepository = userRepository;
        }

        [HttpPost]
        [Route("generate-song")]
        [Authorize]
        public ActionResult GenerateSong([FromBody] GenerateSongClientRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null) return Unauthorized();
            if (userIdClaim != request.UserId) return BadRequest();

            var user = _userRepository.GetById(Guid.Parse(request.UserId));
            if (user == null) return NotFound();

            var song = new Song
            {
                UserId = user.Id,
                Prompt = request.Prompt,
                Lyrics = request.Lyrics,
                LyricsDescription = request.LyricsDescription,
                SongDescription = request.SongDescription,
                Instrumental = request.Instrumental ?? false,
                Status = "queued",
                Title = request.Title,
                GuidanceScale = request.GuidanceScale,
                InferStep = request.InferStep,
                AudioDuration = request.AudioDuration,
                Seed = request.Seed

            };

            var newSong = _songRepository.Create(song);
            if (newSong is null) return BadRequest(new { message = "Something went wrong"});

            GenerateSongDto songProps = new GenerateSongDto
            {
                UserId = user.Id,
                SongId = newSong.Id

            };

            var determineUrlJobId = BackgroundJob.Enqueue(() => _songService.GenerateSong(songProps));
            return Ok(new { message = "Generating song..." });
        }
    }
}

using Api.Dtos;
using Api.Models;
using Api.Repositories;
using Api.Services;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Api.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class JobsController: ControllerBase
    {
        private readonly SongService _songService;
        private readonly ISongRepository _songRepository;

        public JobsController(SongService songService, ISongRepository songRepository)
        {
            _songService = songService;
            _songRepository = songRepository;
        }
        [HttpPost]

        [Route("generate-song")]
        [Authorize]
        public ActionResult GenerateSong([FromBody] GenerateSongClientRequest request)
        {
            var song = new Song
            {
                UserId = Guid.Parse(request.UserId),
                Prompt = request.Prompt ?? "",
                LyricsDescription = request.LyricsDescription ?? "",
                SongDescription = request.SongDescription ?? "",
                Instrumental = request.Instrumental ?? false,
                Title = request.Title,
                GuidanceScale = request.GuidanceScale
            };

            var newSong = _songRepository.Create(song);
            if (newSong is null) return BadRequest(new { message = "Something went wrong"});

            GenerateSongDto songProps = new GenerateSongDto
            {
                UserId = Guid.Parse(request.UserId),
                SongId = newSong.Id

            };

            var determineUrlJobId = BackgroundJob.Enqueue(() => _songService.GenerateSong(songProps));
            return Ok(new { message = "Generating song..." });
        }
    }
}

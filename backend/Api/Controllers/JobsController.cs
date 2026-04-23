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
        public ActionResult GenerateSong()
        {
            var song = new Song
            {
                UserId = Guid.Parse("17dde162-873d-4a27-919e-fe6f2bd1a273"),
                Prompt = "Write a song about how much more difficult building an AI music generator saas has been",
                LyricsDescription = "Fast paced fun song about starting companies",
                Title = "Please work!!"
            };

            var newSong = _songRepository.Create(song);
            if (newSong is null) return BadRequest(new { message = "Something went wrong"});

            GenerateSongDto songProps = new GenerateSongDto
            {
                UserId = Guid.Parse("17dde162-873d-4a27-919e-fe6f2bd1a273"),
                SongId = newSong.Id

            };

            var determineUrlJobId = BackgroundJob.Enqueue(() => _songService.GenerateSong(songProps));
            return Ok(new { message = "Generating song", jobId = determineUrlJobId });
        }
    }
}

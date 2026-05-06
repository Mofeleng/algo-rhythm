using Amazon.S3;
using Amazon.S3.Model;
using Api.Dtos;
using Api.Hubs;
using Api.Models;
using Api.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Services
{
    public class SongService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISongRepository _songRepository;
        private readonly ICategoryRepository _categoryRepository;

        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;
        private readonly IHubContext<SongHub> _hubContext;

        public SongService(
            IUserRepository userRepository,
            IHttpClientFactory clientFactory,
            ISongRepository songRepository,
            ICategoryRepository categoryRepository,
            IConfiguration configuration,
            IHubContext<SongHub> hubContext
        )
        {
            _userRepository = userRepository;
            _songRepository = songRepository;
            _categoryRepository = categoryRepository;
            _configuration = configuration;
            _clientFactory = clientFactory;
            _hubContext = hubContext;
            
        }
        public async Task<GenerateSongBackgroundResponse?> DetermineGenerationEndpoint(GenerateSongDto generateSong)
        {
            //1. Check if user has credits
            var user = _userRepository.GetById(generateSong.UserId);
            if (user != null)
            {
                //Check if song exists on db
                var song = _songRepository.GetById(generateSong.SongId);
                if (song is null) return null;

                string endpoint = "";
                GenerateSongBackgroundJobRequest requestBody = new GenerateSongBackgroundJobRequest();
                //User provided description
                if (song.SongDescription != null)
                {
                    endpoint = _configuration.GetValue<string>("Modal:GenerateFromSongDescription")!;
                    requestBody = new GenerateSongBackgroundJobRequest
                    {
                        song_description = song.SongDescription,
                        guidance_scale = song.GuidanceScale ?? 15.0f,
                        infer_step = song.InferStep ?? 60,
                        audio_duration = song.AudioDuration ?? 30.0f,
                        seed = song.Seed ?? new Random().Next(1, 1000000),
                        instrumental = song.Instrumental
                    };
                } else if (song.Lyrics != null && song.Prompt != null)
                {
                    endpoint = _configuration.GetValue<string>("Modal:GenerateWithLyrics")!;
                    requestBody = new GenerateSongBackgroundJobRequest
                    {
                        lyrics = song.Lyrics,
                        prompt = song.Prompt,
                        guidance_scale = song.GuidanceScale ?? 15.0f,
                        infer_step = song.InferStep ?? 60,
                        audio_duration = song.AudioDuration ?? 30.0f,
                        seed = song.Seed ?? new Random().Next(1, 1000000),
                        instrumental = song.Instrumental
                    };
                } else if (song.LyricsDescription != null && song.Prompt != null)
                {
                    endpoint = _configuration.GetValue<string>("Modal:GenerateWithLyrics")!;
                    requestBody = new GenerateSongBackgroundJobRequest
                    {
                        described_lyrics = song.LyricsDescription,
                        lyrics = "",
                        prompt = song.Prompt,
                        guidance_scale = song.GuidanceScale ?? 15.0f,
                        infer_step = song.InferStep ?? 60,
                        audio_duration = song.AudioDuration ?? 30.0f,
                        seed = song.Seed ?? new Random().Next(1, 1000000),
                        instrumental = song.Instrumental
                    };
                }

                var request = new GenerateSongBackgroundResponse
                {
                    UserId = generateSong.UserId,
                    SongId = generateSong.SongId,
                    Credits = user.Credits,
                    Endpoint = endpoint,
                    Body = requestBody
                };
                return request;
            }

            return null;
        }

       public async Task<GenerateSongResult?> GenerateSong(GenerateSongDto generateSong)
        {
            var request = await DetermineGenerationEndpoint(generateSong);

            if (request is null) return null; //Send failed to user

            var song = _songRepository.GetById(request.SongId);
            var user = _userRepository.GetById(request.UserId);
            if (song is null || user is null) return null;

            if (request.Credits > 0)
            {
                song.Status = "processing";
                _songRepository.SaveChanges();
                await NotifyUser(generateSong.UserId, song.Status, song.Id, song.S3Key, song.ThumbnailS3Key);

                if (string.IsNullOrEmpty(request.Endpoint)) return null; //Todo: More detailed error

                var client = _clientFactory.CreateClient("ModalClient");

                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };

                client.DefaultRequestHeaders.Add("Modal-Key", _configuration.GetValue<string>("Modal:Modal-Key"));
                client.DefaultRequestHeaders.Add("Modal-Secret", _configuration.GetValue<string>("Modal:Modal-Secret"));
                var response = await client.PostAsJsonAsync(new Uri(request.Endpoint), request.Body, options);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<GenerateSongResult>();

                    if (result is null) return null;
                    song.S3Key = result.r2_key;
                    song.Status = "completed";
                    song.ThumbnailS3Key = result.cover_image_r2;

                    if (result.categories != null)
                    {
                        foreach (string s in result.categories)
                        {
                            var c = await _categoryRepository.GetByName(s);
                            if (c == null)
                            {
                                c = _categoryRepository.Create(new Category { Name = s });
                            }
                            song.SongCategories.Add(new SongCategory
                            {
                                SongId = song.Id,
                                CategoryId = c.Id
                            });
                        }
                    }

                    user.Credits -= 20;

                    _songRepository.SaveChanges();
                    _userRepository.SaveChanges();
                    await NotifyUser(generateSong.UserId, song.Status, song.Id, song.S3Key, song.ThumbnailS3Key);

                    return result;
                } 
                var errorJson = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"MODAL ERROR: {errorJson}");

                song.Status = "failed";
                _songRepository.SaveChanges();
                await NotifyUser(generateSong.UserId, song.Status, song.Id, song.S3Key, song.ThumbnailS3Key);

                return null;

            }
            else
            {
                song.Status = "no credits";
                _songRepository.SaveChanges();
                await NotifyUser(generateSong.UserId, song.Status, song.Id, song.S3Key, song.ThumbnailS3Key);

                return null;
            }
       }

        public async Task NotifyUser(Guid userId, string status, Guid songId, string? songUrl, string? thumbnailUrl)
        {
            await _hubContext.Clients.Group(userId.ToString()).SendAsync("RecieveSongUpdate", new
            {
                songId = songId.ToString(),
                status = status,
                songUrl = songUrl,
                thumbnailUrl = thumbnailUrl
            });
        }

        public string GeneratePresignedUrl(
            IAmazonS3 r2Client,
            string bucketName,
            string r2Key
        )
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = r2Key,
                Expires = DateTime.UtcNow.AddHours(2)
            };

            string presignedUrl = r2Client.GetPreSignedURL(request);

            return presignedUrl;
        }
    }
}

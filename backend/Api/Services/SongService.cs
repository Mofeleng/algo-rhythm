using Api.Dtos;
using Api.Models;
using Api.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Services
{
    public class SongService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISongRepository _songRepository;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _clientFactory;
        public SongService(IUserRepository userRepository, IHttpClientFactory clientFactory, ISongRepository songRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _songRepository = songRepository;
            _configuration = configuration;
            _clientFactory = clientFactory;
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
                        infer_step = (int)(song.InferStep ?? 60.0f),
                        audio_duration = song.AudioDuration ?? 100.0f,
                        seed = song.Seed,
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
                        infer_step = (int)(song.InferStep ?? 60.0f),
                        audio_duration = song.AudioDuration ?? 100.0f,
                        seed = song.Seed,
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
                        infer_step = (int)(song.InferStep ?? 60.0f),
                        audio_duration = song.AudioDuration ?? 100.0f,
                        seed = song.Seed,
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
                song.Status = "Processing";
                _songRepository.SaveChanges();

                if (string.IsNullOrEmpty(request.Endpoint)) return null; //Todo: More detailed error

                var client = _clientFactory.CreateClient();

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
                    song.Status = "Completed";
                    song.ThumbnailS3Key = result.cover_image_r2;

                    if (result.categories != null)
                    {
                        foreach (string s in result.categories)
                        {
                            Console.WriteLine(s);
                        }
                    }

                    user.Credits -= 20;

                    _songRepository.SaveChanges();
                    _userRepository.SaveChanges();

                    return result;
                } 
                var errorJson = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"MODAL ERROR: {errorJson}"); // THIS WILL TELL YOU THE EXACT FIELD

                song.Status = "Failed";
                _songRepository.SaveChanges();
                return null;

            }
            else
            {
                song.Status = "No credits";
                _songRepository.SaveChanges();
                return null;
            }
        }
    }
}

using Api.Dtos;
using Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtService _jwtService;

        public AuthController(IUserRepository userRepository, JwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterDto registerDto)
        {
            var user = new User
            {
                Name = registerDto.Name,
                Email = registerDto.Email.ToLower(),
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            _userRepository.Create(user);

            return Ok(new {Message = "Created User" });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto loginDto)
        {
            var user = _userRepository.GetByEmail(loginDto.Email);

            if (user is null) return BadRequest(new { message = "Incorrect email or password" });
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password)) return BadRequest(new { message = "Incorrect email or password" });

            var jwtToken = _jwtService.Generate(user.Id);

            Response.Cookies.Append("jwt", jwtToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,             // Required for SameSite.None
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(1)
            });

            return Ok(new { message = "Success" });
        }

        [HttpGet("user")]
        public IActionResult GetUser()
        {
            try
            {
                var jwt = Request.Cookies["jwt"];
                if (jwt is null) return Unauthorized(new { message = "Unauthorized" });
                var token = _jwtService.Verify(jwt);
                Guid userId = Guid.Parse(token.Subject);
                var user = _userRepository.GetById(userId);

                if (user is null) return NotFound(new { message = "User not found" });
                return Ok(new { user });
            } catch
            {
                return Unauthorized();
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(new { message = "Successfully logged out" });
        }
    }
}

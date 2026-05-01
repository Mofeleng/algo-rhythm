using System.Text.Json.Serialization;

namespace Api.Dtos
{
    public class UserResponseDto
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
    }
}

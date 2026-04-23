using Api.Repositories;

namespace Api.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public int? HasCredits(Guid userId)
        {
            var user = _userRepository.GetById(userId);
            if (user is null) return null;
            if (user.Credits <= 0) return null;
            return user.Credits;
        }
    }
}

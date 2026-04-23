using Api.Models;

namespace Api.Repositories
{
    public interface IUserRepository
    {
        User Create(User user);
        User? GetByEmail(string Email);
        User? GetById(Guid userId);
        void SaveChanges();
    }
}

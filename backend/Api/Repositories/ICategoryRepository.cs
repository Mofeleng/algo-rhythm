using Api.Models;

namespace Api.Repositories
{
    public interface ICategoryRepository
    {
        public Task<Category?> GetByName(string name);
        public Category Create(Category category);

    }
}

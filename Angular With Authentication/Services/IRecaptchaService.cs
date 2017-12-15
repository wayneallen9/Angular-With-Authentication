using System.Threading.Tasks;
namespace Angular_With_Authentication.Services
{
    public interface IRecaptchaService
    {
        Task<bool> VerifyAsync(string response);
    }
}
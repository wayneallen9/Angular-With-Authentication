using System.Threading.Tasks;

namespace Angular_With_Authentication.Services
{
    public interface IMessageService
    {
        Task Send(string email, string subject, string message);
    }
}
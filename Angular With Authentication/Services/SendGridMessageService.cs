using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;
namespace Angular_With_Authentication.Services
{
    public class SendGridMessageService : IMessageService
    {
        private readonly SendGridSettings _sendGrid;
        public SendGridMessageService(IOptions<SendGridSettings> optionsAccessor)
        {
            _sendGrid = optionsAccessor.Value;
        }

        public async Task Send(string email, string subject, string message)
        {
            // create the client
            var client = new SendGridClient(_sendGrid.Secret);

            // set-up the message properties
            var from = new EmailAddress(_sendGrid.From.Address, _sendGrid.From.Name);
            var to = new EmailAddress(email);

            // create the message
            var emailMessage = MailHelper.CreateSingleEmail(from, to, subject, message, message);

            // now send it
            var response = await client.SendEmailAsync(emailMessage);
        }
    }
}

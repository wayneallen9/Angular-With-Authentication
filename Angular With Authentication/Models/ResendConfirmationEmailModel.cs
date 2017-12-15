namespace Angular_With_Authentication.Models
{
    public class ResendConfirmationEmailModel
    {
        public string Email { get; set; }
        public string Recaptcha { get; set; }
    }
}
namespace Angular_With_Authentication.Models
{
    public class NewPasswordModel
    {
        public string Password { get; set; }
        public string Recaptcha { get; set; }
        public string UserId { get; set; }
        public string Token { get; set; }
    }
}
namespace Angular_With_Authentication.Models
{
    public class RegisterUserModel : IUser
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Recaptcha { get; set; }
    }
}
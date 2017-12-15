namespace Angular_With_Authentication.Models
{
    public class SignInUserModel : IUser
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
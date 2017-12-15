namespace Angular_With_Authentication.Models
{
    public class UserModel : IUser
    {
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsExternal { get; set; }
    }
}
using Microsoft.AspNetCore.Identity;
namespace Angular_With_Authentication.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool IsExternal { get; set; }
    }
}
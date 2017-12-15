using AutoMapper;
using Microsoft.AspNetCore.Identity;
namespace Angular_With_Authentication.Models
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<IdentityUser, UserModel>();
        }
    }
}

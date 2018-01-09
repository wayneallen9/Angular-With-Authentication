using AutoMapper;
namespace Angular_With_Authentication.Models
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<ApplicationUser, UserModel>();
        }
    }
}

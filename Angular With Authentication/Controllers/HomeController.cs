using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Diagnostics;
namespace Angular_With_Authentication.Controllers
{
    public class HomeController : Controller
    {
        private readonly Services.RecaptchaSettings configuration;

        public HomeController(IOptions<Services.RecaptchaSettings> optionsAccessor)
        {
            configuration = optionsAccessor.Value;
        }

        public IActionResult Index()
        {
            ViewData["RecaptchaKey"] = configuration.Public;

            return View();
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}

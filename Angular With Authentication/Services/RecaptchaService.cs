using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
namespace Angular_With_Authentication.Services
{
    public class RecaptchaService : IRecaptchaService
    {
        private RecaptchaSettings _configuration;

        public RecaptchaService(IOptions<RecaptchaSettings> optionsAccessor)
        {
            _configuration = optionsAccessor.Value;
        }

        public async Task<bool> VerifyAsync(string response)
        {
            // get the private key for Recaptcha
            var recaptchaPrivateKey = _configuration.PrivateKey;

            // create the request
            var http = new HttpClient();

            // now post the request
            var httpResponse = await http.PostAsync(_configuration.Url, new FormUrlEncodedContent(new Dictionary<string, string> {
                { "secret", recaptchaPrivateKey },
                { "response", response }
            }));

            // make sure the result was successful
            httpResponse.EnsureSuccessStatusCode();

            // get the response
            var content = await httpResponse.Content.ReadAsStringAsync();

            // parse the response as a Json object
            var result = JsonConvert.DeserializeObject(content);

            return (result as dynamic).success;
        }
    }
}
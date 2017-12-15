namespace Angular_With_Authentication.Services
{
    public class RecaptchaSettings
    {
        public string PrivateKey { get; set; }
        public RecaptchaKey Public {get;set;}
        public string Url { get; set; }
    }

    public class RecaptchaKey
    {
        public string Key { get; set; }
    }
}
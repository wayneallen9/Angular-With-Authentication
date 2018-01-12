namespace Angular_With_Authentication.Services
{
    public class JwtSettings
    {
        public int ExpireDays { get; set; }
        public string Issuer { get; set; }
        public string Secret { get; set; }
    }
}
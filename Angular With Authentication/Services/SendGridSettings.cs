namespace Angular_With_Authentication.Services
{
    public class SendGridSettings
    {
        public SendGridFrom From { get; set; }
        public string Secret { get; set; }
    }

    public class SendGridFrom
    {
        public string Address { get; set; }
        public string Name { get; set; }
    }
}
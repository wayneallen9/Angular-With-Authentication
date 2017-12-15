namespace Angular_With_Authentication.Services
{
    public class SendGridSettings
    {
        public SendGridFrom From { get; set; }
        public SendGridKey Private { get; set; }
    }

    public class SendGridFrom
    {
        public string Address { get; set; }
        public string Name { get; set; }
    }

    public class SendGridKey
    {
        public string Key { get; set; }
    }
}
namespace MerchKit.Models
{

    public class MailVariables : IMailVariables
    {

        #region IMailVariables Members

        public string To { get; set; }
        public string ToName { get; set; }
        public string From { get; set; }
        public string FromName { get; set; }
        public string ReplyTo { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public bool IsHtml { get; set; }

        #endregion
    }

}
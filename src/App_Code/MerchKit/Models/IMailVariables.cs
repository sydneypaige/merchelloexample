namespace MerchKit.Models
{
    public interface IMailVariables
    {
        /// <summary>
        /// The recipient email address
        /// </summary>
        string To { get; set; }

        /// <summary>
        /// The recipient's name to mask the "To" email
        /// </summary>
        string ToName { get; set; }

        /// <summary>
        /// The senders email address
        /// </summary>
        string From { get; set; }

        /// <summary>
        /// The senders name to mask the "From" email
        /// </summary>
        string FromName { get; set; }

        /// <summary>
        /// The reply to email address
        /// </summary>
        string ReplyTo { get; set; }

        /// <summary>
        /// The subject of the email to be sent
        /// </summary>
        string Subject { get; set; }

        /// <summary>
        /// The body content of the email to be sent
        /// </summary>
        string Body { get; set; }

        /// <summary>
        /// True/False indicating whether or not the email body content is formatted in HTML
        /// </summary>
        bool IsHtml { get; set; }

    }

}
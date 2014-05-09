using System;
using System.Net.Mail;
using MerchKit.Models;
using Umbraco.Core.Logging;

namespace MerchKit.Services
{
    public class EmailService : IService
    {
        /// <summary>
        /// Sends the email and returns a string confirmation (true) or the error message from the exception generated
        /// </summary>
        public static string SendEmail(IMailVariables mailVars)
        {
            try
            {
                var msg = new MailMessage
                {
                    From = new MailAddress(mailVars.From, mailVars.FromName),
                    Subject = mailVars.Subject,
                    Body = mailVars.Body,
                    IsBodyHtml = mailVars.IsHtml
                };

                msg.To.Add(new MailAddress(mailVars.To, mailVars.ToName));

                // send using the default (web.config) smtp configuration
                var smtp = new SmtpClient();

                smtp.Send(msg);
                return "true";
            }
            catch (Exception ex)
            {

                // log the error
                LogHelper.Error(typeof(EmailService), "Failed to send mail", ex);

                return ex.Message;
            }
        }
    }
}
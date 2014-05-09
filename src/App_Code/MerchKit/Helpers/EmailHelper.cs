using System.Text.RegularExpressions;

namespace MerchKit.Helpers
{
    public static class EmailHelper
    {
        /// <summary>
        /// Returns true or false indicating whether or not the email passed is in a valid format
        /// </summary>
        /// <param name="email">String email addres</param>
        /// <returns>True/False</returns>
        public static bool IsValidEmail(string email)
        {
            return !string.IsNullOrEmpty(email) && Regex.IsMatch(email, @"^[-a-zA-Z0-9][-.a-zA-Z0-9]*@[-.a-zA-Z0-9]+(\.[-.a-zA-Z0-9]+)*\.(com|edu|info|gov|int|mil|net|org|biz|name|museum|coop|aero|pro|[a-zA-Z]{2})$", RegexOptions.IgnorePatternWhitespace);
        }
    }
}
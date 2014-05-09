using System.Collections.Generic;

namespace MerchKit.Models
{
    /// <summary>
    /// Defines contact from mail validation response models
    /// </summary>
    public interface IValidationMessages
    {
        /// <summary>
        /// True/False indicating whether or not the send was successful
        /// </summary>
        bool IsSuccessConfirmation { get; set; }

        /// <summary>
        /// Collection of messages - either errors in validation or a confirmation message
        /// </summary>
        IList<string> Messages { get; }
    }
}
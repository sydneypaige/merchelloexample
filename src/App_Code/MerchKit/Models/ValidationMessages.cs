using System.Collections.Generic;

namespace MerchKit.Models
{
    public class ValidationMessages : IValidationMessages
    {

        public ValidationMessages()
        {
            _messages = new List<string>();
        }

        #region IValidationMessages Members

        public bool IsSuccessConfirmation { get; set; }

        private readonly List<string> _messages;

        public IList<string> Messages
        {
            get
            {
                return _messages;
            }
        }

        #endregion
    }
}

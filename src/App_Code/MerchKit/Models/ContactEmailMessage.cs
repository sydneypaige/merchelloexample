using System.ComponentModel.DataAnnotations;
using Umbraco.Core.Models;

namespace MerchKit.Models
{
    public class ContactEmailMessage
    {
        public IPublishedContent Page { get; set; }

        public int EmailMessageId { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "The email address is required.")]
        [EmailAddress(ErrorMessage = "The email address entered is not in a valid format.")]
        public string Email { get; set; }

        public string Phone { get; set; }

        [Required(ErrorMessage = "A message is required.")]
        public string Message { get; set; }
    }
}
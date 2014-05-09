using System;
using System.Web.Mvc;
using MerchKit.Helpers;
using MerchKit.Models;
using MerchKit.Services;
using Umbraco.Web.Models;
using Umbraco.Web.Mvc;

namespace MerchKit.Controllers
{
    [PluginController("MerchKit")]
    public class ContactFormSurfaceController : SurfaceController
    {
        [ChildActionOnly]
        public ActionResult RenderContactForm(ContactEmailMessage model)
        {
            // fix for passing view data back to form after post
            // our.umbraco.org/forum/developers/apiquestions/37547SurfaceControllerFormPostwithfeedback
            foreach (var d in ControllerContext.ParentActionViewContext.ViewData) { ViewData[d.Key] = d.Value; }

            return PartialView("merchContactForm", model);
        }


        [HttpPost]
        public ActionResult SendEmail(ContactEmailMessage model)
        {
            var validationMsgs = new ValidationMessages();

            // assert the model state is valid and that we have an id from the ContentPicker
            if (ModelState.IsValid)
            {
                ViewBag.Page = CurrentPage;

                // Email settings content
                DynamicPublishedContent settings = Umbraco.Content(model.EmailMessageId);

                // configure the mail variables
                var mailVals = new MailVariables
                {
                    To = settings.GetPropertyValue<string>("to"),
                    ToName = settings.GetPropertyValue<string>("toName"),
                    From = settings.GetPropertyValue<string>("from"),
                    FromName = settings.GetPropertyValue<string>("fromName"),
                    Subject = settings.GetPropertyValue<string>("subject"),
                    Body = settings.GetPropertyValue<string>("emailTemplate")
                            .Replace("%%Name%%", model.Name)
                            .Replace("%%Email%%", model.Email)
                            .Replace("%%Phone%%", model.Phone)
                            .Replace("%%Message%%", model.Message),
                    IsHtml = true
                };

                // send the email
                var mailerMessage = EmailService.SendEmail(mailVals);

                if (mailerMessage == "true")
                {
                    // set the confirmation flags
                    validationMsgs.IsSuccessConfirmation = true;

                    // get the confirmation text from Content data
                    validationMsgs.Messages.Add(settings.GetPropertyValue<string>("confirmation"));

                }
                else
                {
                    validationMsgs.IsSuccessConfirmation = false;


                    // pass the error back to the view
                    validationMsgs.Messages.Add(mailerMessage);
                }
            }
            else
            {
                // the model is not valid throw the hard error
                if (model.EmailMessageId <= 0)
                {
                    throw new MissingFieldException("EmailMessageId was not passed");
                }

                validationMsgs.IsSuccessConfirmation = false;

                // everything except phone is required  pull the validation message from the dictionary if available
                if (string.IsNullOrEmpty(model.Name)) validationMsgs.Messages.Add(string.IsNullOrEmpty(Umbraco.GetDictionaryValue("merchContactNameValidation")) ? "Name is required." : Umbraco.GetDictionaryValue("merchContactNameValidation"));
                if (EmailHelper.IsValidEmail(model.Email)) validationMsgs.Messages.Add(string.IsNullOrEmpty(Umbraco.GetDictionaryValue("merchContactEmailValidation")) ? "The email address is not properly formatted." : Umbraco.GetDictionaryValue("merchContactEmailValidation"));
                if (string.IsNullOrEmpty(model.Message)) validationMsgs.Messages.Add(string.IsNullOrEmpty(Umbraco.GetDictionaryValue("merchContactMessageValidation")) ? "Message is required." : Umbraco.GetDictionaryValue("merchContactMessageValidation"));

            }

            // add the validation messages to the ViewData
            ViewBag.ValidationMessages = validationMsgs;

            return CurrentUmbracoPage();

        }

    }
}
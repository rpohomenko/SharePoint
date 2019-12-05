using Microsoft.SharePoint.Client;
using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace SP.ProjectTaskWeb.Models
{
    public class SPUserInformation
    {
        internal SPUserInformation(User spUser)
        {
            if (spUser == null) throw new ArgumentNullException(nameof(spUser));
            if (spUser.IsPropertyAvailable("Id"))
            {
                Id = spUser.Id;
            }
            if (spUser.IsPropertyAvailable("Title"))
            {
                Initials = ExtractInitialsFromName(spUser.Title);
                Name = spUser.Title;
            }
            if (spUser.IsPropertyAvailable("LoginName"))
            {
                Login = spUser.LoginName;
                ImageUrl = $"~splayouts/userphoto.aspx?accountname={spUser.LoginName.Split('|').Last()}";
            }
            if (spUser.IsPropertyAvailable("IsSiteAdmin"))
            {
                IsSiteAdmin = spUser.IsSiteAdmin;
            }
            if (spUser.IsPropertyAvailable("Email"))
            {
                Email = spUser.Email;
            }
        }

        public int Id { get; private set; }
        public string Initials { get; private set; }
        public string Name { get; private set; }
        public string Login { get; private set; }
        public string Email { get; private set; }
        public bool IsSiteAdmin { get; private set; }
        public string ImageUrl { get; private set; }

        private static string ExtractInitialsFromName(string name)
        {
            // first remove all: punctuation, separator chars, control chars, and numbers (unicode style regexes)
            string initials = Regex.Replace(name, @"[\p{P}\p{S}\p{C}\p{N}]+", "");

            // Replacing all possible whitespace/separator characters (unicode style), with a single, regular ascii space.
            initials = Regex.Replace(initials, @"\p{Z}+", " ");

            // Remove all Sr, Jr, I, II, III, IV, V, VI, VII, VIII, IX at the end of names
            initials = Regex.Replace(initials.Trim(), @"\s+(?:[JS]R|I{1,3}|I[VX]|VI{0,3})$", "", RegexOptions.IgnoreCase);

            // Extract up to 2 initials from the remaining cleaned name.
            initials = Regex.Replace(initials, @"^(\p{L})[^\s]*(?:\s+(?:\p{L}+\s+(?=\p{L}))?(?:(\p{L})\p{L}*)?)?$", "$1$2").Trim();

            if (initials.Length > 2)
            {
                // Worst case scenario, everything failed, just grab the first two letters of what we have left.
                initials = initials.Substring(0, 2);
            }

            return initials.ToUpperInvariant();
        }
    }
}
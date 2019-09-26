using System;
using System.Text;
using System.Xml.Linq;
using SP.Client.Caml.Interfaces;

namespace SP.Client.Caml
{
    public abstract class CamlElement : ICaml
    {
        protected CamlElement(string elementName)
        {
            ElementName = elementName;
        }

        protected CamlElement(string elementName, string existingElement)
        {
            ElementName = elementName;
            Parse(existingElement);
        }

        protected CamlElement(string elementName, XElement existingElement)
        {
            ElementName = elementName;
            Parse(existingElement);
        }

        public string ElementName { get; private set; }

        public virtual XElement ToXElement()
        {
            return new XElement(ElementName);
        }

        private void Parse(XElement existingElement)
        {
            if (existingElement == null) throw new ArgumentNullException(nameof(existingElement));
            if (string.Equals(existingElement.Name.LocalName, ElementName, StringComparison.OrdinalIgnoreCase))
            {
                if ((existingElement.HasAttributes || existingElement.HasElements))
                {
                    OnParsing(existingElement);
                }
            }
            else
            {
                throw new NotSupportedException(existingElement.Name.ToString());
            }
        }

        private void Parse(string existingElement)
        {
            if (!string.IsNullOrEmpty(existingElement))
            {
                var el = XElement.Parse(existingElement, LoadOptions.None);
                Parse(el);
            }
        }

        protected abstract void OnParsing(XElement existingElement);

        public override string ToString()
        {
            return ToString(false);
        }

        public string ToString(bool disableFormatting)
        {
            return disableFormatting
                ? ToXElement().ToString(SaveOptions.DisableFormatting)
                : ToXElement().ToString(SaveOptions.None);
        }

        public string ToString(bool excludeParentTag, bool disableFormatting)
        {
            var caml = ToXElement();
            if (excludeParentTag)
            {
                var sb = new StringBuilder();
                foreach (var element in caml.Elements())
                {
                    if (disableFormatting)
                    {
                        sb.Append(element.ToString(SaveOptions.DisableFormatting));
                    }
                    else
                    {
                        sb.AppendLine(element.ToString(SaveOptions.None));
                    }
                }
                return sb.ToString();
            }
            return ToString(disableFormatting);
        }

        public static implicit operator string(CamlElement caml)
        {
            return caml != null ? caml.ToString() : string.Empty;
        }
    }
}
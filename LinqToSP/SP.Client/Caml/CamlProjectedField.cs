using System.Xml.Linq;
using Microsoft.SharePoint.Client;
using SP.Client.Extensions;

namespace SP.Client.Caml
{
    public sealed class CamlProjectedField : CamlElement
    {
        internal const string FieldTag = "Field";
        internal const string NameAttr = "Name";
        internal const string ListAttr = "List";
        internal const string ShowFieldAttr = "ShowField";
        internal const string TypeAttr = "Type";

        public CamlProjectedField(string fieldName, string listAlias, string lookupField) : base(FieldTag)
        {
            Name = fieldName;
            List = listAlias;
            ShowField = lookupField;
        }

        public CamlProjectedField(string existingElement) : base(FieldTag, existingElement)
        {
        }

        public CamlProjectedField(XElement existingElement) : base(FieldTag, existingElement)
        {
        }

        public string Name { get; set; }
        public string List { get; set; }
        public string ShowField { get; set; }

        protected override void OnParsing(XElement existingField)
        {
            var name = existingField.AttributeIgnoreCase(NameAttr);
            if (name != null)
            {
                Name = name.Value;
            }
            var list = existingField.AttributeIgnoreCase(ListAttr);
            if (list != null)
            {
                List = list.Value;
            }
            var showField = existingField.AttributeIgnoreCase(ShowFieldAttr);
            if (showField != null)
            {
                ShowField = showField.Value;
            }
        }

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (!string.IsNullOrWhiteSpace(Name))
            {
                el.Add(new XAttribute(NameAttr, Name));
            }
            el.Add(new XAttribute(TypeAttr, FieldType.Lookup));
            if (!string.IsNullOrWhiteSpace(List))
            {
                el.Add(new XAttribute(ListAttr, List));
            }
            if (!string.IsNullOrWhiteSpace(ShowField))
            {
                el.Add(new XAttribute(ShowFieldAttr, ShowField));
            }
            return el;
        }
    }
}
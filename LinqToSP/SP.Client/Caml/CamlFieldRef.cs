using SP.Client.Extensions;
using System;
using System.Xml.Linq;

namespace SP.Client.Caml
{
    public sealed class CamlFieldRef : CamlElement
    {
        internal const string FieldRefTag = "FieldRef";
        internal const string NameAttr = "Name";
        internal const string IdAttr = "ID";
        internal const string AscendingAttr = "Ascending";
        internal const string NullableAttr = "Nullable";
        internal const string LookupIdAttr = "LookupId";
        internal const string AliasAttr = "Alias";
        internal const string CreateUrlAttr = "CreateURL";
        internal const string DisplayNameAttr = "DisplayName";
        internal const string ExplicitAttr = "Explicit";
        internal const string KeyAttr = "Key";
        internal const string ListAttr = "List";
        internal const string RefTypeAttr = "RefType";
        internal const string ShowFieldAttr = "ShowField";
        internal const string TextOnlyAttr = "TextOnly";

        public CamlFieldRef()
            : base(FieldRefTag)
        {
        }

        public CamlFieldRef(string existingFieldRef)
            : base(FieldRefTag, existingFieldRef)
        {
        }

        public CamlFieldRef(XElement existingFieldRef)
            : base(FieldRefTag, existingFieldRef)
        {
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool? Ascending { get; set; }
        public bool? Nullable { get; set; }
        public bool? LookupId { get; set; }
        public string Alias { get; set; }
        public string CreateUrl { get; set; }
        public string DisplayName { get; set; }
        public bool? Explicit { get; set; }
        public string Key { get; set; }
        public string List { get; set; }
        public string RefType { get; set; }
        public string ShowField { get; set; }
        public bool? TextOnly { get; set; }

        protected override void OnParsing(XElement existingFieldRef)
        {
            var name = existingFieldRef.AttributeIgnoreCase(NameAttr);
            if (name != null)
            {
                Name = name.Value;
            }
            var id = existingFieldRef.AttributeIgnoreCase(IdAttr);
            var guidString = id != null ? id.Value.Trim() : null;
            if (guidString != null && guidString.Length > 0)
            {
                Id = new Guid(guidString);
            }
            var ascending = existingFieldRef.AttributeIgnoreCase(AscendingAttr);
            if (ascending != null)
            {
                Ascending = Convert.ToBoolean(ascending.Value);
            }
            var nullable = existingFieldRef.AttributeIgnoreCase(NullableAttr);
            if (nullable != null)
            {
                Nullable = Convert.ToBoolean(nullable.Value);
            }
            var lookupId = existingFieldRef.AttributeIgnoreCase(LookupIdAttr);
            if (lookupId != null)
            {
                LookupId = Convert.ToBoolean(lookupId.Value);
            }
            var alias = existingFieldRef.AttributeIgnoreCase(AliasAttr);
            if (alias != null)
            {
                Alias = alias.Value;
            }
            var createUrl = existingFieldRef.AttributeIgnoreCase(CreateUrlAttr);
            if (createUrl != null)
            {
                CreateUrl = createUrl.Value;
            }
            var displayNameAttr = existingFieldRef.AttributeIgnoreCase(DisplayNameAttr);
            if (displayNameAttr != null)
            {
                DisplayName = displayNameAttr.Value;
            }
            var @explicit = existingFieldRef.AttributeIgnoreCase(ExplicitAttr);
            if (@explicit != null)
            {
                Explicit = Convert.ToBoolean(@explicit.Value);
            }
            var key = existingFieldRef.AttributeIgnoreCase(KeyAttr);
            if (key != null)
            {
                Key = key.Value;
            }
            var list = existingFieldRef.AttributeIgnoreCase(ListAttr);
            if (list != null)
            {
                List = list.Value;
            }
            var refType = existingFieldRef.AttributeIgnoreCase(RefTypeAttr);
            if (refType != null)
            {
                RefType = refType.Value;
            }
            var showField = existingFieldRef.AttributeIgnoreCase(ShowFieldAttr);
            if (showField != null)
            {
                ShowField = showField.Value;
            }
            var textOnly = existingFieldRef.AttributeIgnoreCase(TextOnlyAttr);
            if (textOnly != null)
            {
                TextOnly = Convert.ToBoolean(textOnly.Value);
            }
        }

        public override XElement ToXElement()
        {
            var el = new XElement(FieldRefTag);
            if (!string.IsNullOrWhiteSpace(List))
            {
                el.Add(new XAttribute(ListAttr, List));
            }
            if (Id != Guid.Empty)
            {
                el.Add(new XAttribute(IdAttr, Id));
            }
            else if (!string.IsNullOrWhiteSpace(Name))
            {
                el.Add(new XAttribute(NameAttr, Name));
            }
            if (Ascending.HasValue)
            {
                el.Add(new XAttribute(AscendingAttr, Ascending.Value.ToString().ToUpper()));
            }
            if (Nullable.HasValue)
            {
                el.Add(new XAttribute(NullableAttr, Nullable.Value.ToString().ToUpper()));
            }
            if (LookupId.HasValue)
            {
                el.Add(new XAttribute(LookupIdAttr, LookupId.Value.ToString().ToUpper()));
            }
            if (!string.IsNullOrWhiteSpace(Alias))
            {
                el.Add(new XAttribute(AliasAttr, Alias));
            }
            if (!string.IsNullOrWhiteSpace(CreateUrl))
            {
                el.Add(new XAttribute(CreateUrlAttr, CreateUrl));
            }
            if (!string.IsNullOrWhiteSpace(DisplayName))
            {
                el.Add(new XAttribute(DisplayNameAttr, DisplayName));
            }
            if (Explicit.HasValue)
            {
                el.Add(new XAttribute(ExplicitAttr, Explicit.Value.ToString().ToUpper()));
            }
            if (!string.IsNullOrWhiteSpace(Key))
            {
                el.Add(new XAttribute(KeyAttr, Key));
            }
            if (!string.IsNullOrWhiteSpace(RefType))
            {
                el.Add(new XAttribute(RefTypeAttr, RefType));
            }
            if (!string.IsNullOrWhiteSpace(ShowField))
            {
                el.Add(new XAttribute(ShowFieldAttr, ShowField));
            }
            if (TextOnly.HasValue)
            {
                el.Add(new XAttribute(TextOnlyAttr, TextOnly.Value.ToString().ToUpper()));
            }
            return el;
        }

        public override string ToString()
        {
            return ToXElement().ToString();
        }
    }
}
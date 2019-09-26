using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using JetBrains.Annotations;
using SP.Client.Caml.Interfaces;
using SP.Client.Extensions;

namespace SP.Client.Caml
{
    public sealed class ViewFieldsCamlElement : CamlElement, ICamlMultiField, ICollection<CamlFieldRef>
    {
        internal const string ViewFieldsTag = "ViewFields";

        public ViewFieldsCamlElement() : base(ViewFieldsTag)
        {
            FieldRefs = Enumerable.Empty<CamlFieldRef>();
        }

        public ViewFieldsCamlElement(IEnumerable<string> viewFields) : base(ViewFieldsTag)
        {
            if (viewFields != null)
            {
                FieldRefs = viewFields.Select(viewField => new CamlFieldRef { Name = viewField });
            }
        }

        public ViewFieldsCamlElement(string existingViewFields) : base(ViewFieldsTag, existingViewFields)
        {
        }

        public ViewFieldsCamlElement(XElement existingViewFields) : base(ViewFieldsTag, existingViewFields)
        {
        }

        public IEnumerable<CamlFieldRef> FieldRefs { get; private set; }

        public int Count => (FieldRefs != null ? FieldRefs.Count() : 0);

        public bool IsReadOnly => true;

        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (FieldRefs != null)
            {
                foreach (var fieldRef in FieldRefs)
                {
                    el.Add(fieldRef.ToXElement());
                }
            }
            return el;
        }

        protected override void OnParsing(XElement existingViewFields)
        {
            FieldRefs = existingViewFields.ElementsIgnoreCase(CamlFieldRef.FieldRefTag)
                .Select(existingFieldRef => new CamlFieldRef(existingFieldRef));
        }

        public void Add([NotNull] string fieldName)
        {
            if (!string.IsNullOrEmpty(fieldName))
            {
                Add(new CamlFieldRef { Name = fieldName });
            }
        }

        public void Add([NotNull] CamlFieldRef item)
        {
            FieldRefs = FieldRefs ?? Enumerable.Empty<CamlFieldRef>();

            if (item != null && !FieldRefs.Any(vf => vf.Name == item.Name))
            {
                FieldRefs = FieldRefs.Concat(new[] { item });
            }
        }

        public void AddRange([NotNull] IEnumerable<string> fieldNames)
        {
            if (fieldNames != null)
            {
                foreach (var fieldName in fieldNames)
                {
                    Add(fieldName);
                }
            }
        }

        public void AddRange([NotNull] IEnumerable<CamlFieldRef> items)
        {
            if (items != null)
            {
                foreach (var item in items)
                {
                    Add(item);
                }
            }
        }

        public void Clear()
        {
            FieldRefs = Enumerable.Empty<CamlFieldRef>();
        }

        public bool Contains([NotNull] CamlFieldRef item)
        {
            if (item != null && FieldRefs != null)
                return FieldRefs.Any(f => f.Name == item.Name);
            return false;
        }

        public void CopyTo(CamlFieldRef[] array, int arrayIndex)
        {
            if (FieldRefs != null)
                FieldRefs.ToArray().CopyTo(array, arrayIndex);
        }

        public bool Remove([NotNull] string fieldName)
        {
            return Remove(new CamlFieldRef() { Name = fieldName });
        }

        public bool Remove([NotNull] CamlFieldRef item)
        {
            if (item != null && FieldRefs != null)
            {
                return FieldRefs.ToList().RemoveAll(f => f.Name == item.Name) > 0;
            }
            return false;
        }

        IEnumerator<CamlFieldRef> IEnumerable<CamlFieldRef>.GetEnumerator()
        {
            return GetEnumerator() as IEnumerator<CamlFieldRef>;
        }

        public IEnumerator GetEnumerator()
        {
            return FieldRefs != null ? FieldRefs.GetEnumerator() : Enumerable.Empty<CamlFieldRef>().GetEnumerator();
        }
    }
}
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using JetBrains.Annotations;
using SP.Client.Caml.Interfaces;
using SP.Client.Extensions;

namespace SP.Client.Caml.Clauses
{
    public sealed class CamlOrderBy : CamlClause, ICamlMultiField, ICollection<CamlFieldRef>
    {
        internal const string OrderByTag = "OrderBy";

        public CamlOrderBy() : base(OrderByTag)
        {
        }

        public CamlOrderBy(string fieldName, bool ascending)
            : this(new CamlFieldRef() { Name = fieldName, Ascending = ascending })
        {
        }
        public CamlOrderBy(Guid fieldId, bool ascending)
            : this(new CamlFieldRef() { Id = fieldId, Ascending = ascending })
        {
        }

        public CamlOrderBy(CamlFieldRef fieldRef)
            : this(new[] { fieldRef })
        {
        }

        public CamlOrderBy(IEnumerable<CamlFieldRef> fieldRefs)
            : base(OrderByTag)
        {
            FieldRefs = fieldRefs ?? throw new ArgumentNullException("fieldRefs");
        }

        public CamlOrderBy(IEnumerable<string> fieldNames)
            : base(OrderByTag)
        {
            if (fieldNames == null) throw new ArgumentNullException("fieldNames");
            FieldRefs = fieldNames.Select(fieldName => new CamlFieldRef { Name = fieldName });
        }

        public CamlOrderBy(IEnumerable<Guid> fieldIds)
            : base(OrderByTag)
        {
            if (fieldIds == null) throw new ArgumentNullException("fieldIds");
            FieldRefs = fieldIds.Select(fieldId => new CamlFieldRef { Id = fieldId });
        }

        public CamlOrderBy(string existingOrderBy)
            : base(OrderByTag, existingOrderBy)
        {
        }

        public CamlOrderBy(XElement existingOrderBy)
            : base(OrderByTag, existingOrderBy)
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
                foreach (var fieldRef in FieldRefs.Where(fieldRef => fieldRef != null))
                {
                    el.Add(fieldRef.ToXElement());
                }
            }
            return el;
        }

        protected override void OnParsing(XElement existingOrderBy)
        {
            var existingFieldRefs = existingOrderBy.ElementsIgnoreCase(CamlFieldRef.FieldRefTag);
            FieldRefs = existingFieldRefs.Select(existingFieldRef => new CamlFieldRef(existingFieldRef));
        }

        public static CamlOrderBy Combine(CamlOrderBy firstOrderBy, CamlOrderBy secondOrderBy)
        {
            CamlOrderBy orderBy = null;
            var fieldRefs = new List<CamlFieldRef>();
            if (firstOrderBy != null && firstOrderBy.FieldRefs != null)
            {
                fieldRefs.AddRange(firstOrderBy.FieldRefs);
            }
            if (secondOrderBy != null && secondOrderBy.FieldRefs != null)
            {
                foreach (CamlFieldRef fieldRef in secondOrderBy.FieldRefs)
                {
                    CamlFieldRef existingFieldRef =
                        fieldRefs.Find(fr => fr.Name == fieldRef.Name || fr.Id == fieldRef.Id);
                    if (existingFieldRef != null)
                    {
                        existingFieldRef.Ascending = fieldRef.Ascending;
                    }
                    else
                    {
                        fieldRefs.Add(fieldRef);
                    }
                }
                //fieldRefs.AddRange(secondOrderBy.FieldRefs);
            }
            if (fieldRefs.Count > 0)
            {
                orderBy = new CamlOrderBy(fieldRefs);
            }
            return orderBy;
        }

        public void Add([NotNull] string fieldName, bool? ascending = null)
        {
            if (!string.IsNullOrEmpty(fieldName))
            {
                Add(new CamlFieldRef { Name = fieldName, Ascending = ascending });
            }
        }

        public void Add([NotNull] CamlFieldRef item)
        {
            if (item != null)
                if (FieldRefs != null)
                {
                    var fieldRefs = FieldRefs.ToArray();
                    var field = fieldRefs.FirstOrDefault(fRef => fRef.Name == item.Name);
                    if (field == null)
                    {
                        FieldRefs = fieldRefs.Concat(new[] { item });
                    }
                    else
                    {
                        field.Ascending = item.Ascending;
                        FieldRefs = fieldRefs.AsEnumerable();
                    }
                }
                else
                {
                    FieldRefs = new[] { item }.AsEnumerable();
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

        public static CamlOrderBy operator +(CamlOrderBy firstOrderBy, CamlOrderBy secondOrderBy)
        {
            return Combine(firstOrderBy, secondOrderBy);
        }
    }
}
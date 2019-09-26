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
    public sealed class CamlGroupBy : CamlClause, ICamlMultiField, ICollection<CamlFieldRef>
    {
        internal const string GroupByTag = "GroupBy";
        internal const string CollapseAttr = "Collapse";
        internal const string GroupLimitAttr = "GroupLimit";
        public CamlGroupBy(bool? collapse = null, int? limit = null) : base(GroupByTag)
        {
            Collapse = collapse;
            Limit = limit;
        }

        public CamlGroupBy(CamlFieldRef fieldRef, bool? collapse = null, int? limit = null)
            : this(new[] { fieldRef }, collapse, limit)
        {
        }

        public CamlGroupBy(IEnumerable<CamlFieldRef> fieldRefs, bool? collapse = null, int? limit = null)
            : base(GroupByTag)
        {
            if (fieldRefs == null) throw new ArgumentNullException("fieldRefs");
            FieldRefs = fieldRefs;
            Collapse = collapse;
            Limit = limit;
        }

        public CamlGroupBy(IEnumerable<string> fieldNames, bool? collapse = null, int? limit = null)
            : base(GroupByTag)
        {
            if (fieldNames == null) throw new ArgumentNullException("fieldNames");
            FieldRefs = fieldNames.Select(fieldName => new CamlFieldRef { Name = fieldName });
            Collapse = collapse;
            Limit = limit;
        }

        public CamlGroupBy(IEnumerable<Guid> fieldIds, bool? collapse = null, int? limit = null)
            : base(GroupByTag)
        {
            if (fieldIds == null) throw new ArgumentNullException("fieldIds");
            FieldRefs = fieldIds.Select(fieldId => new CamlFieldRef { Id = fieldId });
            Collapse = collapse;
            Limit = limit;
        }

        public CamlGroupBy(string existingGroupBy)
            : base(GroupByTag, existingGroupBy)
        {
        }

        public CamlGroupBy(XElement existingGroupBy)
            : base(GroupByTag, existingGroupBy)
        {
        }

        public bool? Collapse { get; set; }

        public int? Limit { get; set; }

        public IEnumerable<CamlFieldRef> FieldRefs { get; private set; }

        public int Count => (FieldRefs != null ? FieldRefs.Count() : 0);

        public bool IsReadOnly => true;
        
        public override XElement ToXElement()
        {
            var el = base.ToXElement();
            if (Collapse != null) el.Add(new XAttribute(CollapseAttr, Collapse.ToString().ToUpper()));
            if (Limit != null) el.Add(new XAttribute(GroupLimitAttr, Limit));
            if (FieldRefs != null)
            {
                foreach (var fieldRef in FieldRefs.Where(fieldRef => fieldRef != null))
                {
                    el.Add(fieldRef.ToXElement());
                }
            }
            return el;
        }

        protected override void OnParsing(XElement existingGroupBy)
        {
            var existingFieldRefs = existingGroupBy.ElementsIgnoreCase(CamlFieldRef.FieldRefTag);
            FieldRefs = existingFieldRefs.Select(existingFieldRef => new CamlFieldRef(existingFieldRef));
            XAttribute collaps = existingGroupBy.Attribute(CollapseAttr);
            if (collaps != null)
            {
                Collapse = Convert.ToBoolean(collaps.Value);
            }
            XAttribute limit = existingGroupBy.Attribute(GroupLimitAttr);
            if (limit != null)
            {
                Limit = Convert.ToInt32(limit.Value);
            }
        }

        public void Combine(CamlGroupBy groupBy)
        {
            if (groupBy != null)
            {
                var fieldRefs = new List<CamlFieldRef>();
                if (FieldRefs != null)
                {
                    fieldRefs.AddRange(FieldRefs);
                }
                if (groupBy.Limit != null)
                {
                    Limit = Limit == null ? groupBy.Limit.Value : Math.Max(Limit.Value, groupBy.Limit.Value);
                }
                if (groupBy.Collapse != null)
                {
                    Collapse = Collapse == null ? groupBy.Collapse.Value : Collapse.Value | groupBy.Collapse.Value;
                }

                if (groupBy.FieldRefs != null)
                {
                    fieldRefs.AddRange(groupBy.FieldRefs);
                }
                this.FieldRefs = fieldRefs.ToArray();
            }
        }

        public static CamlGroupBy Combine(CamlGroupBy firstGroupBy, CamlGroupBy secondGroupBy)
        {
            CamlGroupBy groupBy = null;
            bool collapse = false;
            int? limit = null;
            var fieldRefs = new List<CamlFieldRef>();
            if (firstGroupBy != null && firstGroupBy.FieldRefs != null)
            {
                if (firstGroupBy.Limit != null)
                {
                    limit = firstGroupBy.Limit;
                }
                if (firstGroupBy.Collapse != null) collapse = firstGroupBy.Collapse.Value;
                fieldRefs.AddRange(firstGroupBy.FieldRefs);
            }
            if (secondGroupBy != null && secondGroupBy.FieldRefs != null)
            {
                if (secondGroupBy.Limit != null)
                {
                    limit = limit != null ? Math.Max(secondGroupBy.Limit.Value, limit.Value) : secondGroupBy.Limit;
                }
                if (secondGroupBy.Collapse != null)
                {
                    collapse = collapse | secondGroupBy.Collapse.Value;
                }
                fieldRefs.AddRange(secondGroupBy.FieldRefs);
            }
            if (fieldRefs.Count > 0)
            {
                groupBy = new CamlGroupBy(fieldRefs, collapse, limit);
            }
            return groupBy;
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
            if (item != null)
                if (FieldRefs != null)
                {
                    var fieldRefs = FieldRefs.ToArray();
                    var field = fieldRefs.FirstOrDefault(fRef => fRef.Name == item.Name);
                    if (field == null)
                    {
                        FieldRefs = fieldRefs.Concat(new[] { item });
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
      
        public static CamlGroupBy operator +(CamlGroupBy firstGroupBy, CamlGroupBy secondGroupBy)
        {
            return Combine(firstGroupBy, secondGroupBy);
        }
    }
}